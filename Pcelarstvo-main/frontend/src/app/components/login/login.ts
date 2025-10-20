import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private userService: UserService, private router: Router, private dialog: MatDialog) {}

  login() {
    this.userService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.errorMessage = '';
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        if (res.role == 'administrator'){
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Login failed.';
      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }

  openChangePassword() {
    this.dialog.open(ChangePasswordDialog, {
      width: '420px',
      data: {
        presetUsername: this.username || localStorage.getItem('username') || ''
      }
    });
  }
}

/* ---------------- Dialog for PW change ---------------- */

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Change Password</h2>

    <div mat-dialog-content>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="username">
      </mat-form-field>

      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Old Password</mat-label>
        <input matInput [(ngModel)]="oldPassword" type="password">
      </mat-form-field>

      <mat-form-field appearance="fill" class="full-width">
        <mat-label>New Password</mat-label>
        <input matInput [(ngModel)]="newPassword" type="password">
      </mat-form-field>

      <div class="error" *ngIf="error">{{ error }}</div>
      <div class="success" *ngIf="success">{{ success }}</div>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onClose()" [disabled]="loading">Close</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="loading">
        {{ loading ? 'Saving…' : 'Change Password' }}
      </button>
    </div>
  `,
  styles: [`
    .full-width { width: 100%; }
    .error { color: #d32f2f; margin-top: 6px; }
    .success { color: #2e7d32; margin-top: 6px; }
  `]
})
export class ChangePasswordDialog {
  username = '';
  oldPassword = '';
  newPassword = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { presetUsername: string },
    private userService: UserService
  ) {
    this.username = data?.presetUsername || '';
  }

  onClose() {
    this.dialogRef.close();
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.username || !this.oldPassword || !this.newPassword) {
      this.error = 'All fields are required.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters long.';
      return;
    }

    this.loading = true;
    this.userService.changePassword({
      username: this.username,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password successfully changed';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to change password.';
      }
    });
  }
}
