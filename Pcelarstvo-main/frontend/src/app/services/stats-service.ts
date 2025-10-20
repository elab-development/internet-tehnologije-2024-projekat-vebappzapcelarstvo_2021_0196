import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private http: HttpClient) { }

  getCompletionsByMonth() {
    return this.http.get('http://localhost:3000/stats/completions-by-month');
  }

  getCommentsByBeekeeper() {
    return this.http.get('http://localhost:3000/stats/comments-by-beekeeper');
  }
}
