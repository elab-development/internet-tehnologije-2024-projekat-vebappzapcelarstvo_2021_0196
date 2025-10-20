import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GoogleChartsModule } from 'angular-google-charts';
import { PublicAPIService } from '../../services/public-apiservice';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Admin as AdminService, TaskLite } from '../../services/admin';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

type DayStatus = 'DONE' | 'ASSIGNED_FUTURE' | 'ASSIGNED_PAST';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatCardModule,
    GoogleChartsModule, MatSelectModule, MatFormFieldModule,
    MatIconModule, MatDatepickerModule, MatTabsModule,
    FormsModule, ReactiveFormsModule, MatInputModule,
    MatNativeDateModule, MatTooltipModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  // Belgrade latitude and longitude
  lat = 44.8;
  lon = 20.47;
  daysWeather = 7;
  daysAQ = 7;

  loadingWeather = false;
  loadingAQ = false;
  weatherError = '';
  aqError = '';

  beekeepers: { id: number; username: string; name: string; surname: string }[] = [];
  selectedBeekeeperId: number | null = null;
  selectedTaskId: number | null = null;
  futureTasks: TaskLite[] = [];
  assignMessage = '';
  assigning = false;

  newTask = {
    title: '',
    description: '',
    start_at: null as Date | null,
    end_at: null as Date | null
  };

  editTasks: TaskLite[] = [];
  selectedEditTaskId: number | null = null;
  editing = false;
  editMsg = '';

  editTask = {
    title: '',
    description: '',
    start_at: null as Date | null,
    end_at: null as Date | null
  };

  
  viewMonth = new Date();
  daysGrid: { date: Date; label: string; key: string; status?: DayStatus; descriptions?: string[]; }[] = [];

  constructor(private api: PublicAPIService, private adminAPI: AdminService) {}

  weatherChart: any = {
    chartType: 'LineChart',
    columns: ['Date', 'T max (°C)', 'T min (°C)'],
    data: [],
    options: {
      legend: { position: 'bottom' },
      height: 320,
      chartArea: { width: '85%', height: '70%' },
      hAxis: { format: 'MM-dd', slantedText: true, slantedTextAngle: 45 },
      vAxis: { title: '°C' },
      colors: ['#d32f2f', '#1976d2']
    }
  };

  airChart: any = {
    chartType: 'LineChart',
    columns: ['Time', 'O₃ (µg/m³)', 'CO (µg/m³)', 'PM2.5 (µg/m³)'],
    data: [],
    options: {
      legend: { position: 'bottom' },
      height: 320,
      chartArea: { width: '85%', height: '70%' },
      hAxis: { format: 'MM-dd HH:mm', showTextEvery: 6, slantedText: true, slantedTextAngle: 45 },
      vAxis: { title: 'µg/m³', viewWindow: { min: 0 } }
    }
  };

  ngOnInit() {
    this.loadWeather();
    this.loadAQ();
    this.buildMonthGrid();   
    this.loadBeekeepers();  
    this.loadFutureTasks(); 
    this.loadEditableTasks(); 
  }

  // ------- Weather & AQ -------
  loadWeather() {
    this.loadingWeather = true;
    this.weatherError = '';
    this.api.getForecast(this.lat, this.lon, this.daysWeather, 'Europe/Belgrade')
      .subscribe({
        next: (res) => {
          const rows = (res?.data?.data ?? []).map((d: any) => {
            const dt = new Date(d.date);
            return [dt, Number(d.tmax ?? 0), Number(d.tmin ?? 0)];
          });
          this.weatherChart = { ...this.weatherChart, data: rows };
          this.loadingWeather = false;
        },
        error: (err) => {
          this.weatherError = err?.error?.message || 'Failed to load weather.';
          this.loadingWeather = false;
        }
      });
  }

  loadAQ() {
    this.loadingAQ = true;
    this.aqError = '';
    this.api.getAirQuality(this.lat, this.lon, this.daysAQ, 'Europe/Belgrade')
      .subscribe({
        next: (res) => {
          const hours = res?.data?.hours ?? [];
          const rows = hours.map((h: any) => [
            new Date(h.time),
            h.ozone ?? null,
            h.carbon_monoxide ?? null,
            h.pm2_5 ?? null
          ]);
          this.airChart = { ...this.airChart, data: rows };
          this.loadingAQ = false;
        },
        error: (err) => {
          this.aqError = err?.error?.message || 'Failed to load air quality.';
          this.loadingAQ = false;
        }
      });
  }

  // ------- Beekeepers & Calendar -------
  loadBeekeepers() {
    this.adminAPI.getBeekeepers().subscribe({
      next: (res) => {
        this.beekeepers = res.items || [];
        if (!this.selectedBeekeeperId && this.beekeepers.length) {
          this.selectedBeekeeperId = this.beekeepers[0].id;
          this.loadCalendar();
        }
      },
      error: (e) => console.error('beekeepers load error', e)
    });
  }

  onBeekeeperSelected() {
    this.loadCalendar();
  }

  onPrevMonth() {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1);
    this.buildMonthGrid(); 
  }

  onNextMonth() {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    this.buildMonthGrid(); 
  }

  private monthBounds(d: Date) {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
    return { from: fmt(first), to: fmt(last) };
  }

  private buildMonthGrid() {
    const firstDay = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth(), 1);
    const startDow = (firstDay.getDay() + 6) % 7; 
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDow);

    const cells: { date: Date; key: string; label: string; status?: DayStatus }[] = [];
    for (let i = 0; i < 42; i++) { 
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      cells.push({ date: d, key, label: String(d.getDate()) });
    }
    this.daysGrid = cells;

    
    if (this.selectedBeekeeperId) {
      this.loadCalendar();
    }
  }

  private loadCalendar() {
    if (!this.selectedBeekeeperId) return;
    const { from, to } = this.monthBounds(this.viewMonth);
    this.adminAPI.getBeekeeperCalendar(this.selectedBeekeeperId, from, to)
      .subscribe({
        next: (res) => {
          debugger;
          const map = new Map(res.items.map(x => [x.date, x]));
          this.daysGrid = this.daysGrid.map(c => {
            const hit = map.get(c.key);
            return hit ? { ...c, status: hit.status as DayStatus, descriptions: hit.descriptions || [] }
                      : { ...c, status: undefined, descriptions: [] };
          });
        },
        error: (e) => console.error('calendar error', e)
      });
  }

  loadFutureTasks() {
    this.adminAPI.getFutureTasks().subscribe({
      next: (res) => {
        this.futureTasks = res.items || [];
      },
      error: (e) => console.error('future tasks load error', e)
    });
  }

  assignTask() {
    if (!this.selectedBeekeeperId) return;
    this.assigning = true;
    this.assignMessage = '';

    if (this.selectedTaskId) {
      // assign existing
      this.adminAPI.assignExistingTask(this.selectedBeekeeperId, this.selectedTaskId).subscribe({
        next: () => {
          this.assignMessage = 'Task assigned successfully.';
          this.assigning = false;
          this.loadCalendar();   
        },
        error: (e) => {
          this.assignMessage = 'Task already asigned to this user, pick another!';
          this.assigning = false;
        }
      });
    } else {
      // create + assign
      const startISO = this.newTask.start_at ? this.newTask.start_at.toISOString() : '';
      const endISO   = this.newTask.end_at   ? this.newTask.end_at.toISOString()   : '';

      this.adminAPI.createAndAssignTask(this.selectedBeekeeperId, {
        title: this.newTask.title.trim(),
        description: this.newTask.description?.trim(),
        start_at: startISO,
        end_at: endISO
      }).subscribe({
        next: () => {
          this.assignMessage = 'New task created and assigned successfully.';
          this.assigning = false;
          this.selectedTaskId = null;
          this.newTask = { title: '', description: '', start_at: null, end_at: null };
          this.loadFutureTasks();
          this.loadCalendar();
        },
        error: (e) => {
          this.assignMessage = e?.error?.message || 'Failed to create/assign task.';
          this.assigning = false;
        }
      });
    }
  }

private loadEditableTasks() {
  this.adminAPI.getFutureTasks().subscribe({
      next: (res) => { this.editTasks = res.items || []; },
      error: (e) => console.error('loadEditableTasks error', e)
  });
}

onPickTaskForEdit() {
  this.editMsg = '';
  const t = this.editTasks.find(x => x.id === this.selectedEditTaskId);
  if (!t) {
    this.editTask = { title: '', description: '', start_at: null, end_at: null };
    return;
  }
  this.editTask = {
    title: t.title || '',
    description: t.description || '',
    start_at: t.start_at ? new Date(t.start_at) : null,
    end_at: t.end_at ? new Date(t.end_at) : null
  };
}

saveEditedTask() {
  if (!this.selectedEditTaskId || !this.editTask.title || !this.editTask.start_at || !this.editTask.end_at) return;

  this.editing = true;
  this.editMsg = '';

  const payload = {
    title: this.editTask.title.trim(),
    description: this.editTask.description?.trim() || '',
    start_at: this.editTask.start_at.toISOString(),
    end_at: this.editTask.end_at.toISOString()
  };

  this.adminAPI.updateTask(this.selectedEditTaskId, payload).subscribe({
    next: () => {
      this.editMsg = 'Task updated.';
      this.editing = false;
      // refresh lists
      this.loadEditableTasks();
      this.loadFutureTasks();
      if (this.selectedBeekeeperId) this.loadCalendar();
    },
    error: (e) => {
      this.editMsg = e?.error?.message || 'Failed to update task.';
      this.editing = false;
    }
  });
}

deleteEditedTask() {
    if (!this.selectedEditTaskId) return;

    if (!confirm('Delete this task? Assignments to this task will be removed.')) return;

    this.editing = true;
    this.editMsg = '';

    this.adminAPI.deleteTask(this.selectedEditTaskId).subscribe({
      next: () => {
        this.editMsg = 'Task deleted.';
        this.editing = false;
        // clear form
        this.selectedEditTaskId = null;
        this.editTask = { title: '', description: '', start_at: null, end_at: null };
        // refresh lists
        this.loadEditableTasks();
        this.loadFutureTasks();
        if (this.selectedBeekeeperId) this.loadCalendar();
      },
      error: (e) => {
        this.editMsg = e?.error?.message || 'Failed to delete task.';
        this.editing = false;
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '';
  }
}
