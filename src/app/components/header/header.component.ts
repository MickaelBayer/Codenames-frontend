import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UnRegistredAccount, UnAuthAccount, Account } from 'src/app/models/account.model';
import { SignInDialogComponent } from './sign-in-dialog/sign-in-dialog.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { AccountService } from 'src/app/services/account.service';
import { environment } from '../../../environments/environment';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleDrawer = new EventEmitter<void>();

  authAccount: Account;
  authAccountSub: Subscription;

  unRegitredAccount: UnRegistredAccount;
  unAuthAccount: UnAuthAccount;

  constructor(
    public dialog: MatDialog,
    public accountService: AccountService,
    public uiService: UiService,
  ) { }

  ngOnInit(): void {
    this.accountService.viewOnwProfile();
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (value: Account) => {
        this.authAccount = value;
      }
    );
    this.accountService.emitAuthAccount();
  }

  onRegister(): void {
    const dialogRef = this.dialog.open(SignInDialogComponent, {
      data: this.unRegitredAccount
    });

    dialogRef.afterClosed().subscribe((result: UnRegistredAccount) => {
      if (result && result.username && result.email && result.password) {
        this.accountService.register(result);
      }
    });
  }

  onlogin(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      data: this.unAuthAccount
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.email && result.password) {
        this.accountService.login(result);
      }
    });
  }

  onLogout(): void {
    this.accountService.logout();
  }

  getProfileImage(): string {
    return environment.baseURL + this.authAccount.profile_image;
  }

  ngOnDestroy(): void {
    this.authAccountSub.unsubscribe();
  }

}