import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import { UserLoginDialogComponent } from '../userLoginDialog/userLoginDialog.component';
import { AuthMethod } from '../common/authMethodList/authMethodList.component';

const LOGIN_METHODS: AuthMethod[] = [
  {
    type: 'LINE',
    icon: 'assets/icons/line.svg',
    labelKey: 'user-login-select.line',
  },
  {
    type: 'X',
    icon: 'assets/icons/x.svg',
    labelKey: 'user-login-select.x',
  },
  {
    type: 'GOOGLE',
    icon: 'assets/icons/google.svg',
    labelKey: 'user-login-select.google',
  },
  {
    type: 'EMAIL',
    icon: 'assets/icons/mail.svg',
    labelKey: 'user-login-select.email',
  },
];

@Component({
  selector: 'app-user-login-select',
  standalone: false,
  templateUrl: './userLoginSelect.component.html',
  styleUrls: [
    './userLoginSelect.component.css',
    './userLoginSelect.responsive.component.css',
  ],
})
export class UserLoginSelectComponent implements OnInit {
  loginMethods: AuthMethod[] = LOGIN_METHODS;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  selectMethod(loginMethod: AuthMethod): void {
    if (loginMethod.type === 'EMAIL') {
      this.openLoginDialog();
      return;
    }
    alert(this.translateService.instant('user-login-select.coming-soon'));
  }

  private openLoginDialog(): void {
    const dialogRef = this.dialog.open(UserLoginDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.success) return;
      if (result.data?.coin !== undefined) {
        this.userService.saveCoin(result.data.coin);
      }
      if (result.data?.ticket !== undefined) {
        this.userService.saveTicket(result.data.ticket);
      }
      this.router.navigate(['/userGachaPage']);
    });
  }
}
