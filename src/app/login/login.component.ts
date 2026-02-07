import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private service: AppService,
    private router: Router,
    private dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  isLogin = true;
  showPassword = false;
  showError = false;
  showErrorLogin = false;

  toggleView() {
    this.isLogin = !this.isLogin;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  signUpForm = new FormGroup({
    name: new FormControl(null, Validators.required),
    username: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/),
    ]),
    password: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl(null, Validators.required),
  });

  loginForm = new FormGroup({
    username: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
  });

  onSignUp() {
    if (
      this.signUpForm.valid &&
      this.signUpForm.controls.confirmPassword.value == this.signUpForm.controls.password.value
    ) {
      const payload = {
        username: this.signUpForm.controls.username.value,
        name: this.signUpForm.controls.name.value,
        password: this.signUpForm.controls.password.value,
      };
      this.service.signup(payload).subscribe({
        next: (res: any) => {
          this.isLogin = true;
        },
        error: (err: any) => {
          alert(err.error.message);
        },
      });
    } else {
      this.showError = true;
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      const payload = {
        username: this.loginForm.controls.username.value,
        password: this.loginForm.controls.password.value,
      };
      this.service.login(payload).subscribe({
        next: (res: any) => {
          this.service.isLoggedIn = true;
          this.service.userDetails = res.data;
          this.dialogRef.close();
          if (this.data?.redirectTo) {
            this.router.navigateByUrl(this.data.redirectTo);
          }
        },
        error: (err: any) => {
          alert(err.error.message);
        },
      });
    } else {
      this.showErrorLogin = true;
    }
  }
}
