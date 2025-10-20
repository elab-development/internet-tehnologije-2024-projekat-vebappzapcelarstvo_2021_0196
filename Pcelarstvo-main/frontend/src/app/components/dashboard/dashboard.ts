import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatCardModule }    from '@angular/material/card';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UserUiService } from '../../services/user-ui-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { forkJoin, lastValueFrom } from 'rxjs';



type DayStatus = 'DONE' | 'ASSIGNED_FUTURE' | 'ASSIGNED_PAST';

interface DayCell {
  date: Date;
  key: string;
  label: string;
  status?: DayStatus;
  tasks?: { title: string; description: string }[];
  assignmentId?: number;        
  taskTitle?: string;          
  taskDescription?: string;     
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  @ViewChild('calendarCard', { static: false }) calendarCard!: ElementRef;

  viewMonth = new Date();
  daysGrid: DayCell[] = [];
  loading = false;
  error = '';

  constructor(private api: UserUiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.buildMonthGrid();
    this.loadCalendar();
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  async exportPdf() {
    debugger;
    try {
      // Full current year bounds
      const year = new Date().getFullYear();
      const from = `${year}-01-01`;
      const to   = `${year}-12-31`;

      // 1) Fetch all assignments for the year
      const yearCal = await lastValueFrom(
        this.api.getUserCalendar(from, to)
      );

      const items = yearCal.items || [];
      if (!items.length) {
        alert('No assignments this year to export.');
        return;
      }

      // 2) Flatten to a list of assignment entries (one per day item)
      // items[] looks like: { date, status, assignment_id, tasks: [{title, description}] }
      const entries = items
        .map(it => ({
          date: it.date,
          status: it.status as DayStatus,
          assignmentId: it.assignment_id,
          title: it.tasks?.[0]?.title ?? '',
          description: it.tasks?.[0]?.description ?? ''
        }))
        // Some backends could theoretically return duplicates; dedupe by assignmentId:
        .filter(e => e.assignmentId != null);

      // 3) Fetch comments/details for each assignment in parallel
      const uniqByAid = new Map<number, typeof entries[0]>();
      entries.forEach(e => uniqByAid.set(e.assignmentId!, e));
      const uniqueEntries = [...uniqByAid.values()];

      const detailRequests = uniqueEntries.map(e =>
        this.api.getAssignmentDetails(e.assignmentId!)
      );
      const details = await lastValueFrom(forkJoin(detailRequests));

      // Map assignment_id -> comments[]
      const commentsByAid = new Map<number, { id:number; text:string; created_at:string; author:string }[]>();
      details.forEach(det => {
        commentsByAid.set(det.assignment_id, det.comments || []);
      });

      // 4) Build table rows sorted by date
      const rows = uniqueEntries
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e, idx) => {
          const statusLabel =
            e.status === 'DONE' ? 'DONE' :
            e.status === 'ASSIGNED_PAST' ? 'OVERDUE' : 'To be done';

          const cmts = (commentsByAid.get(e.assignmentId!) || [])
            .map(c => `${new Date(c.created_at).toLocaleString()} — ${c.text} (${c.author})`)
            .join('\n');

          return [
            String(idx + 1),    // Number
            e.title,
            e.description,
            e.date,             // Due date
            statusLabel,
            cmts
          ];
        });

      // 5) Compose PDF
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      // Title
      doc.setFontSize(18);
      doc.text(`ASSIGNMENT TABLE — ${year}`, 40, 50);

      // Table
      autoTable(doc, {
        startY: 80,
        head: [['#', 'Title', 'Description', 'Due date', 'Status', 'Comments']],
        body: rows,
        styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
        headStyles: { fillColor: [11, 53, 88], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 30 },   // Number
          1: { cellWidth: 150 },  // Title
          2: { cellWidth: 220 },  // Description
          3: { cellWidth: 90 },   // Due date
          4: { cellWidth: 95 },   // Status
          5: { cellWidth: 260 },  // Comments
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const v = String(data.cell.raw || '');
            if (v === 'DONE') {
              data.cell.styles.fillColor = [156, 255, 177]; // green
            } else if (v === 'OVERDUE') {
              data.cell.styles.fillColor = [255, 145, 145]; // red
            } else {
              data.cell.styles.fillColor = [250, 224, 139]; // yellow
            }
          }
        }
      });

      // 6) Save (browser prompts where to save)
      const fname = `assignments-${year}.pdf`;
      doc.save(fname);
    } catch (err) {
      console.error(err);
      alert('Failed to export yearly PDF.');
    }
  }



  onPrevMonth() {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1);
    this.buildMonthGrid();
    this.loadCalendar();
  }

  onNextMonth() {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    this.buildMonthGrid();
    this.loadCalendar();
  }

  private fmtDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private monthBounds(d: Date) {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { from: this.fmtDate(first), to: this.fmtDate(last) };
  }

  private buildMonthGrid() {
    const firstDay = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth(), 1);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDow);

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push({
        date: d,
        key: this.fmtDate(d),
        label: String(d.getDate()),
        status: undefined,
        tasks: []
      });
    }
    this.daysGrid = cells;
  }

  private loadCalendar() {
    this.loading = true;
    this.error = '';
    const { from, to } = this.monthBounds(this.viewMonth);

    this.api.getUserCalendar(from, to).subscribe({
      next: (res) => {
        debugger;
        const map = new Map(res.items.map((it: any) => [it.date, it]));
        this.daysGrid = this.daysGrid.map(c => {
          const hit = map.get(c.key);
          if (hit) {
            const t = (hit.tasks && hit.tasks[0]) || { title: '', description: '' };
            return {
              ...c,
              status: hit.status as DayStatus,
              tasks: hit.tasks || [],
              assignmentId: hit.assignment_id,
              taskTitle: t.title,
              taskDescription: t.description
            };
          }
          return { ...c, status: undefined, tasks: [], assignmentId: undefined, taskTitle: undefined, taskDescription: undefined };
        });
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed to load calendar.';
        this.loading = false;
      }
    });
  }

  onDayClick(d: DayCell) {
    const populated = Boolean(
      d.status &&
      d.assignmentId && 
      (d.tasks?.length ?? 0) > 0
    );
    if (!populated) return;

    this.dialog.open(AssignmentDialog, {
      width: '560px',
      data: {
        assignmentId: d.assignmentId,
        date: d.key,
        title: d.tasks?.[0]?.title || '',
        description: d.tasks?.[0]?.description || ''
      }
    }).afterClosed().subscribe(changed => {
      if (changed === 'done' || changed === 'commented') {
        this.loadCalendar();
      }
    });
  }
}

/* -------------------- Dialog -------------------- */

@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatTabsModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title style="margin-bottom: 5px;">Assignment</h2>

    <mat-tab-group>
      <!-- TAB 1: Assignment -->
      <mat-tab label="Assignment">
        <div mat-dialog-content *ngIf="loading">Loading…</div>
        <div mat-dialog-content *ngIf="error">{{ error }}</div>

        <div mat-dialog-content *ngIf="!loading && !error && assignment">
          <div class="actions-row" style="margin-bottom: 12px;">
            <mat-form-field appearance="outline" floatLabel="always" class="grow">
              <mat-label>Result Note (optional)</mat-label>
              <textarea matInput rows="3" [(ngModel)]="resultNote"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary"
                    (click)="markDone()"
                    [disabled]="assignment.status === 'DONE' || saving" style="margin-left: 72px;">
              {{ saving ? 'Saving…' : 'Mark Assignment Done' }}
            </button>
          </div>

          <hr>

          <!-- Optional: show task info -->
          <div *ngIf="assignment.tasks?.length" style="margin-top: 12px;">
            <h4 style="margin: 0 0 4px 0;">{{ assignment.tasks[0].title }}</h4>
            <p style="margin: 0;">{{ assignment.tasks[0].description }}</p>
          </div>
        </div>
      </mat-tab>

      <!-- TAB 2: Comments -->
      <mat-tab label="Comments">
        <div mat-dialog-content *ngIf="commentsLoading">Loading comments…</div>
        <div mat-dialog-content *ngIf="commentsError">{{ commentsError }}</div>

        <div mat-dialog-content *ngIf="!commentsLoading && !commentsError">
          <div *ngIf="comments?.length; else noComments">
            <div *ngFor="let c of comments"
                 style="margin-bottom: 10px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
              <strong>{{ c.author }}</strong>
              <small>({{ c.created_at | date:'short' }})</small>
              <div style="white-space: pre-wrap;">{{ c.text }}</div>
            </div>
          </div>
          <ng-template #noComments>
            <p><i>No comments yet.</i></p>
          </ng-template>

          <!-- Add new comment -->
          <div style="margin-top: 12px;">
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>New Comment</mat-label>
              <textarea matInput rows="2" [(ngModel)]="newCommentText"></textarea>
            </mat-form-field>
            <button mat-raised-button color="accent"
                    (click)="addCommentForAssignment()"
                    [disabled]="savingComment">
              {{ savingComment ? 'Adding…' : 'Add Comment' }}
            </button>
          </div>
        </div>
      </mat-tab>
    </mat-tab-group>

    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class AssignmentDialog implements OnInit {
  saving = false;
  savingComment = false;

  assignment: any;
  loading = false;
  error = '';
  resultNote = '';

  comments: { id: number; text: string; created_at: string; author: string }[] = [];
  commentsLoading = false;
  commentsError = '';
  newCommentText = '';

  constructor(
    public dialogRef: MatDialogRef<AssignmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { assignmentId: number },
    private api: UserUiService
  ) {}

  ngOnInit() {
    this.loadDetails();   
    this.loadComments();  
  }

  private loadDetails() {
    this.loading = true;
    this.error = '';
    this.api.getAssignmentDetails(this.data.assignmentId).subscribe({
      next: (res: any) => {
        debugger;
        this.assignment = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load assignment.';
        this.loading = false;
      }
    });
  }

  private loadComments() {
    this.commentsLoading = true;
    this.commentsError = '';
    this.api.getAssignmentDetails(this.data.assignmentId).subscribe({
      next: (res: any) => {
        this.comments = res?.comments ?? [];
        this.commentsLoading = false;
      },
      error: (err) => {
        this.commentsError = err?.error?.message || 'Failed to load comments.';
        this.commentsLoading = false;
      }
    });
  }

  markDone() {
    if (this.saving) return;
    this.saving = true;

    this.api.markAssignmentDone(this.data.assignmentId, this.resultNote).subscribe({
      next: () => {
        if (this.assignment) this.assignment.status = 'DONE';
        this.dialogRef.close('done');
      },
      error: (err) => {
        this.saving = false;
        alert(err?.error?.message || 'Failed to mark as done.');
      }
    });
  }

  addCommentForAssignment() {
    const text = (this.newCommentText || '').trim();
    if (!text) return;
    debugger;
    const taskId =
      this.assignment?.tasks?.[0]?.task_id ??
      this.assignment?.task_id;

    if (!taskId) {
      alert('Task ID is missing; cannot add comment.');
      return;
    }

    this.savingComment = true;
    this.api.addAssignmentComment(this.data.assignmentId, taskId, text).subscribe({
      next: () => {
        this.comments.unshift({
          id: Date.now(),
          text,
          created_at: new Date().toISOString(),
          author: 'You'
        });
        this.newCommentText = '';
        this.savingComment = false;
      },
      error: (err) => {
        this.savingComment = false;
        alert(err?.error?.message || 'Failed to add comment.');
      }
    });
  }
}
