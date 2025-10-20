import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserUiService {
  private base = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  getAssignmentDetails(assignmentId: number): Observable<{
    assignment_id: number;
    title: string;
    description: string;
    comments: { id: number; text: string; created_at: string; author: string }[];
    status: 'DONE' | 'ASSIGNED_FUTURE' | 'ASSIGNED_PAST';
  }> {
    const headers = this.authHeaders();
    const params = new HttpParams()
      .set('assignmentId', String(assignmentId))
      .set('pageSize', '200');

    return this.http
      .get<{ total: number; items: any[]; task_id: any; }>(`${this.base}/comments`, { headers, params })
      .pipe(
        map(res => ({
          assignment_id: assignmentId,
          task_id: res.task_id || null,
          title: '',
          description: '',
          status: 'ASSIGNED_FUTURE' as const,
          comments:
            (res.items || []).map(it => ({
              id: it.id,
              text: it.content,
              created_at: it.created_at,
              author:
                (it.name || it.surname)
                  ? `${it.name ?? ''} ${it.surname ?? ''}`.trim()
                  : (it.username || `User #${it.author_id}`)
            })) ?? []
        }))
      );
  }

  addAssignmentComment(
    assignmentId: number,
    taskId: number,
    text: string
  ): Observable<{ ok: boolean }> {
    debugger;
    const headers = this.authHeaders();
    return this.http.post<{ ok: boolean }>(
      `${this.base}/comments`,
      { task_id: taskId, assignment_id: assignmentId, content: text.trim() },
      { headers }
    );
  }

  markAssignmentDone(
    assignmentId: number,
    result_note?: string
  ): Observable<{ assignmentId: number; status: 'DONE' }> {
    debugger;
    const headers = this.authHeaders();
    return this.http.put<{ assignmentId: number; status: 'DONE' }>(
      `${this.base}/assignments/${assignmentId}/done`,
      result_note ? { result_note } : {},
      { headers }
    );
  }

  getUserCalendar(from: string, to: string) {
    const headers = this.authHeaders();
    return this.http.get<{
      items: {
        date: string;
        status: 'DONE' | 'ASSIGNED_FUTURE' | 'ASSIGNED_PAST';
        assignment_id: number;
        tasks: { assignment_id: number; title: string; description: string }[];
      }[];
    }>(`${this.base}/calendar`, { headers, params: { from, to } });
  }
}
