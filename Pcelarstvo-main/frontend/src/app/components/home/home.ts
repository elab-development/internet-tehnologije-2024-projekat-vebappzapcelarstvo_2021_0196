import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GoogleChartsModule } from 'angular-google-charts';
import { StatsService } from '../../services/stats-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    GoogleChartsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  completionsChart: any = {
    chartType: 'ColumnChart',
    data: [],
    columns: ['Month', 'Done'],
    options: {
      legend: 'none',
      height: 320,
      chartArea: { width: '85%', height: '70%' },
      vAxis: { minValue: 0, gridlines: { color: 'rgba(0,0,0,0.06)' } },
      hAxis: { slantedText: true, slantedTextAngle: 20 }
    }
  };

  commentsChart: any = {
    chartType: 'BarChart',
    data: [],
    columns: ['Beekeeper', 'Comments'],
    options: {
      legend: 'none',
      height: 320,
      chartArea: { width: '75%', height: '75%' },
      vAxis: { textStyle: { fontSize: 12 } },
      hAxis: { minValue: 0, gridlines: { color: 'rgba(0,0,0,0.06)' } }
    }
  };

  constructor(private stats: StatsService) {}

  ngOnInit() {
    this.loadCompletions();
    this.loadComments();
  }

  private loadCompletions() {
    this.stats.getCompletionsByMonth().subscribe((res: any) => {
      this.completionsChart = {
        ...this.completionsChart,
        data: res.data?.map((x: any) => [x.month, Number(x.doneCount)]) ?? []
      };
    });
  }

  private loadComments() {
    this.stats.getCommentsByBeekeeper().subscribe((res: any) => {
      this.commentsChart = {
        ...this.commentsChart,
        data: res.data?.map((x: any) => [x.fullName, Number(x.commentsCount)]) ?? []
      };
    });
  }
}
