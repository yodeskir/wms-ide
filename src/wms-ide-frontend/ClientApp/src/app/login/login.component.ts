import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoginService } from '../services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthResult } from './authResult';
import { MapStateService } from '../services/map-state.service';
import { MapState } from '../map-state';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  authResult: AuthResult;
  username = 'yodeski';
  password = 'lolo';
  return = '';

  constructor(private loginService: LoginService,
    private mapStateService: MapStateService,
    private router: Router,
    private notification: NzNotificationService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/wmsmap');
  }

  doLogin() {
    this.loginService.doLogin(this.username, this.password).subscribe(authResult => {
      this.handleResult(authResult);
    });
  }
  handleResult(authResult: AuthResult): any {
    const mapstate: MapState = this.mapStateService.getMapState();
    if (authResult) {
      switch (authResult.statusCode) {
        case 200:
          mapstate.token = authResult.token;
          mapstate.username = this.username;
          this.router.navigateByUrl(this.return);
          break;
        case 401:
          this.createNotification('error', 'Sign in', 'Invalid user name or password.');
          break;
        default:
          this.createNotification('error', 'Sign in', authResult.statusMessage);
      }
    } else {
      this.createNotification('error', 'Sign in', 'Server Unexpected Error');
    }
  }

  registerNewAccount() {
    this.createNotification('info', 'Register', "This should get you to the registration page.");
  }

  resetPassword() {
    this.createNotification('info', 'Reset password', "This should get you to Reset password page.");
  }

  createNotification(type: string, title: string, text: string): void {
    this.notification.create(type, title, text);
  }
}
