import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, LottieComponent, MatSnackBarModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private service: AppService,
    private router: Router,
    private dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  lottieOptions = {
    path: '../../assets/animations/success.json',
    loop: false,
    autoplay: true,
  };

  private animationItemLogIn: any;
  private animationItemSignUp: any;

  animationCreatedSignUp(animation: any) {
    this.animationItemSignUp = animation;
    this.setSpeedSignUp(3);
  }
  animationCreatedLogIn(animation: any) {
    this.animationItemLogIn = animation;
    this.setSpeedLogIn(3);
  }

  setSpeedLogIn(speed: number) {
    if (this.animationItemLogIn) {
      this.animationItemLogIn.setSpeed(speed);
    }
  }

  setSpeedSignUp(speed: number) {
    if (this.animationItemSignUp) {
      this.animationItemSignUp.setSpeed(speed);
    }
  }

  onAnimationCompleteLogIn() {
    this.dialogRef.close(true);
    if (this.data?.redirectTo) {
      this.router.navigateByUrl(this.data.redirectTo);
    } else if (this.router.url == '/products' || this.router.url == '/cart') {
      this.checkAndUpdateCartProducts();
    }
    const payload = {
      flag: true,
      data: this.service.userDetails,
    };
    setTimeout(() => {
      this.service.loginNext(payload);
    });
  }

  onAnimationCompleteSignUp() {
    this.isLogin = true;
    this.showLoginPw = false;
    this.showSignupPw = false;
    this.showSignUpSuccess = false;
    this.showLogInSuccess = false;
    this.cd.detectChanges();
  }

  isLogin: boolean | null = true;
  showSignUpSuccess = false;
  showLogInSuccess = false;
  showLoginPw = false;
  showSignupPw = false;
  showError = false;
  showErrorLogin = false;
  existingUsername: any;
  otpDisabled = false;
  showOtpInput = false;
  showOtpButton = true;
  otpButtonLabel: string = 'Send OTP';

  toggleView() {
    this.isLogin = !this.isLogin;
    this.showLoginPw = false;
    this.showSignupPw = false;
  }

  toggleLoginPw() {
    this.showLoginPw = !this.showLoginPw;
  }

  toggleSignupPw() {
    this.showSignupPw = !this.showSignupPw;
  }

  signUpForm = new FormGroup({
    name: new FormControl(null, Validators.required),
    username: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/),
    ]),
    otp: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern('^\\d+$')]),
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
      this.signUpForm.controls.confirmPassword.value == this.signUpForm.controls.password.value &&
      this.signUpForm.controls.username.status == 'DISABLED'
    ) {
      const payload = {
        username: String(this.signUpForm.controls.username.value)?.trim(),
        name: String(this.signUpForm.controls.name.value)?.trim(),
        password: this.signUpForm.controls.password.value,
      };
      this.service.signup(payload).subscribe({
        next: (res: any) => {
          this.showSignUpSuccess = true;
          this.isLogin = null;
        },
        error: (err: any) => {
          const message = err.error.message;
          if (message == 'User already exists') {
            this.snackBar.open('Username already exists', 'Close', {
              duration: 3000, // 3 seconds
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            });
            this.existingUsername = this.signUpForm.controls.username.value;
            this.signUpForm.controls.username.enable();
            this.showOtpButton = true;
            clearInterval(this.intervalId);
            this.otpButtonLabel = 'Send OTP';
            this.otpDisabled = false;
          }
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
          this.showLogInSuccess = true;
          this.isLogin = null;
          // setTimeout(() => {
          // this.dialogRef.close(true);
          // if (this.data?.redirectTo) {
          //   this.router.navigateByUrl(this.data.redirectTo);
          // } else if (this.router.url == '/products' || this.router.url == '/cart') {
          //   this.checkAndUpdateCartProducts();
          // }
          // }, 5000);
        },
        error: (err: any) => {
          this.snackBar.open(err.error.message, 'Close', {
            duration: 3000, // 3 seconds
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
          // alert(err.error.message);
        },
      });
    } else {
      this.showErrorLogin = true;
    }
  }

  checkAndUpdateCartProducts() {
    this.service.getLoggedInCartProducts().subscribe((res: any) => {
      if (res.data?.length == 0) {
        if (this.service.totalItems > 0) {
          const products = this.service.getCartProducts()?.map((ele: any) => {
            return {
              id: ele._id,
              quantity: ele.quantity,
            };
          });
          this.service.setCartProducts(products).subscribe((res: any) => {});
        }
      } else {
        window.location.reload();
      }
    });
  }

  intervalId: any;

  onGetOtp() {
    const payload = {
      email: this.signUpForm.controls.username.value,
      resendFlag: this.otpButtonLabel == 'Resend OTP',
    };
    this.service.sendOtp(payload).subscribe((res: any) => {
      this.service.getSnackbar('Your OTP is ' + res.data);
      this.showOtpInput = true;
      this.otpDisabled = true;
      this.otpButtonLabel = 'Resend in 30';
      let count = 29;
      this.intervalId = setInterval(() => {
        if (count == 0) {
          this.otpButtonLabel = 'Resend OTP';
          this.otpDisabled = false;
          clearInterval(this.intervalId);
          return;
        }
        this.otpButtonLabel = `Resend in ${count}`;
        count--;
      }, 1000);
    });
  }

  onValidateOtp() {
    const payload = {
      email: this.signUpForm.controls.username.value,
      otp: this.signUpForm.controls.otp.value,
    };
    this.service.validateOtp(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message, 'Close', {
          duration: 3000, // 3 seconds
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
        if (res.message == 'Too many incorrect attempts') {
          this.showOtpInput = false;
          this.signUpForm.controls.username.reset();
          this.otpButtonLabel = 'Send OTP';
          return;
        }
        if (res?.flag) {
          this.showOtpInput = false;
          this.signUpForm.controls.username.disable();
          this.showOtpButton = false;
        } else {
          this.signUpForm.controls.otp.setValue(null);
          // this.signUpForm.controls.otp.markAsTouched();
          // this.signUpForm.controls.otp.markAsTouched();
          // this.signUpForm.controls.otp.updateValueAndValidity();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.snackBar.open(error.message, 'Close', {
          duration: 3000, // 3 seconds
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onForgot() {
    if (this.loginForm.controls.username.invalid) {
      this.snackBar.open('Please enter username', 'Close', {
        duration: 3000, // 3 seconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      return;
    }
  }
}
