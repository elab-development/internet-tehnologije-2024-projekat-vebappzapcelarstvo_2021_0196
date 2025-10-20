import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginPayload {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  login(data: LoginPayload): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', data);
  }

  register(data: {
    username: string;
    password: string;
    name: string;
    surname: string;
  }): Observable<any> {
    return this.http.post('http://localhost:3000/auth/register', data);
  }

  changePassword(payload: { username: string; oldPassword: string; newPassword: string; }) {
    return this.http.post<{ ok: boolean }>(
      'http://localhost:3000/auth/changePW',
      payload
    );
  }
}
