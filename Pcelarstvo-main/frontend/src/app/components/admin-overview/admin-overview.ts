import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { Admin } from '../../services/admin';
import { MatIconModule } from '@angular/material/icon';

type FiltersForm = {
  from: Date | null;
  to: Date | null;
  status: string;
  beekeeperId: number | null;
  taskId: number | null;
};

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatCardModule, MatTabsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule,
    MatIconModule
  ],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.scss'
})
export class AdminOverview implements OnInit {
  constructor(private fb: FormBuilder, private api: Admin, private router: Router) {}

  form!: FormGroup;
  activeTab = 0;

  tasksCols = ['id','title','start_at','end_at','assignments_total','assignments_done','source_type'];
  tasks = { total: 0, data: [] as any[], page: 1, pageSize: 10, loading: false, error: '' };

  commentsCols = ['id','task_title','author','content','created_at'];
  comments = { total: 0, data: [] as any[], page: 1, pageSize: 10, loading: false, error: '' };

  completedCols = ['assignment_id','task_title','beekeeper','done_at','result_note'];
  completed = { total: 0, data: [] as any[], page: 1, pageSize: 10, loading: false, error: '' };

  @ViewChild('pTasks') pTasks!: MatPaginator;
  @ViewChild('pComments') pComments!: MatPaginator;
  @ViewChild('pCompleted') pCompleted!: MatPaginator;

  // sort state per tab
  tasksSort: Sort = { active: '', direction: '' };
  commentsSort: Sort = { active: '', direction: '' };
  completedSort: Sort = { active: '', direction: '' };

  ngOnInit(): void {
    this.form = this.fb.group<FiltersForm>({
      from: null,
      to: null,
      status: '',
      beekeeperId: null,
      taskId: null
    } as any);

    this.loadActive();
  }

  tabChanged(idx: number) {
    this.activeTab = idx;
    this.applyFilters();
  }

  applyFilters() {
    if (this.activeTab === 0) this.tasks.page = 1;
    if (this.activeTab === 1) this.comments.page = 1;
    if (this.activeTab === 2) this.completed.page = 1;
    this.loadActive(true);
  }

  private fmtDate(d?: Date | null) {
    if (!d) return undefined;
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  pageEvent(kind: 'tasks' | 'comments' | 'completed', pageIndex: number, pageSize: number) {
    if (kind === 'tasks')    { this.tasks.page = pageIndex + 1; this.tasks.pageSize = pageSize; }
    if (kind === 'comments') { this.comments.page = pageIndex + 1; this.comments.pageSize = pageSize; }
    if (kind === 'completed'){ this.completed.page = pageIndex + 1; this.completed.pageSize = pageSize; }
    this.loadActive();
  }

  sortChanged(kind: 'tasks'|'comments'|'completed', ev: Sort) {
    if (kind === 'tasks')    this.tasksSort = ev;
    if (kind === 'comments') this.commentsSort = ev;
    if (kind === 'completed')this.completedSort = ev;
    this.applySort(kind);
  }

  private applySort(kind: 'tasks'|'comments'|'completed') {
    const state = kind === 'tasks' ? this.tasksSort
               : kind === 'comments' ? this.commentsSort
               : this.completedSort;

    if (!state.active || !state.direction) return;

    const dir = state.direction === 'asc' ? 1 : -1;

    const getVal = (row: any, col: string) => {
      switch (kind) {
        case 'tasks':
          if (col === 'start_at' || col === 'end_at') return row[col] ? new Date(row[col]).getTime() : 0;
          if (col === 'assignments_total' || col === 'assignments_done') return Number(row[col] ?? 0);
          if (col === 'id') return Number(row.id ?? 0);
          return (row[col] ?? '').toString().toLowerCase();

        case 'comments':
          if (col === 'created_at') return row.created_at ? new Date(row.created_at).getTime() : 0;
          if (col === 'author') return `${row.name ?? ''} ${row.surname ?? ''}`.trim().toLowerCase();
          if (col === 'id') return Number(row.id ?? 0);
          return (row[col] ?? '').toString().toLowerCase();

        case 'completed':
          if (col === 'done_at') return row.done_at ? new Date(row.done_at).getTime() : 0;
          if (col === 'assignment_id') return Number(row.assignment_id ?? 0);
          if (col === 'beekeeper') return `${row.name ?? ''} ${row.surname ?? ''}`.trim().toLowerCase();
          return (row[col] ?? '').toString().toLowerCase();
      }
    };

    const cmp = (a: any, b: any) => {
      const va = getVal(a, state.active);
      const vb = getVal(b, state.active);
      if (va < vb) return -1 * dir;
      if (va > vb) return  1 * dir;
      return 0;
    };

    if (kind === 'tasks')    this.tasks.data = [...this.tasks.data].sort(cmp);
    if (kind === 'comments') this.comments.data = [...this.comments.data].sort(cmp);
    if (kind === 'completed')this.completed.data = [...this.completed.data].sort(cmp);
  }

  private loadActive(force = false) {
    if (!this.form) return;

    const { from, to, status, beekeeperId, taskId } = this.form.value as FiltersForm;
    const f = this.fmtDate(from);
    const t = this.fmtDate(to);

    if (this.activeTab === 0) {
      this.tasks.loading = true; this.tasks.error = '';
      this.api.getTasks({
        from: f, to: t,
        status: status || undefined,
        page: this.tasks.page, pageSize: this.tasks.pageSize
      }).subscribe({
        next: (res) => {
          this.tasks.total = res.total;
          this.tasks.data = res.items;
          this.tasks.loading = false;
          if (this.tasksSort.active && this.tasksSort.direction) this.applySort('tasks');
        },
        error: (e) => {
          this.tasks.error = e?.error?.message || 'Failed to load tasks.';
          this.tasks.loading = false;
        }
      });
    }

    if (this.activeTab === 1) {
      this.comments.loading = true; this.comments.error = '';
      this.api.getComments({
        from: f, to: t,
        beekeeperId: beekeeperId ?? undefined,
        taskId: taskId ?? undefined,
        page: this.comments.page, pageSize: this.comments.pageSize
      }).subscribe({
        next: (res) => {
          this.comments.total = res.total;
          this.comments.data = res.items;
          this.comments.loading = false;
          if (this.commentsSort.active && this.commentsSort.direction) this.applySort('comments');
        },
        error: (e) => {
          this.comments.error = e?.error?.message || 'Failed to load comments.';
          this.comments.loading = false;
        }
      });
    }

    if (this.activeTab === 2) {
      this.completed.loading = true; this.completed.error = '';
      this.api.getCompleted({
        from: f, to: t,
        beekeeperId: beekeeperId ?? undefined,
        taskId: taskId ?? undefined,
        page: this.completed.page, pageSize: this.completed.pageSize
      }).subscribe({
        next: (res) => {
          this.completed.total = res.total;
          this.completed.data = res.items;
          this.completed.loading = false;
          if (this.completedSort.active && this.completedSort.direction) this.applySort('completed');
        },
        error: (e) => {
          this.completed.error = e?.error?.message || 'Failed to load completed.';
          this.completed.loading = false;
        }
      });
    }
  }

  environment(){
    this.router.navigate(['/admin']);
  }

  logout(){
    localStorage.clear();
    window.location.href = '';
  }
}
