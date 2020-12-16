import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UnAuthAccount } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, OnDestroy {

  errorMsgs: any;
  errorMsgSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnAuthAccount,
    public accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.data = new UnAuthAccount(undefined, undefined);
    this.errorMsgSub = this.accountService.errorMsgs$.subscribe(
      (msgs: any) => {
        this.errorMsgs = msgs;
      }
    );
  }

  onNoClick(): void {
    this.accountService.clearErrorMsgs();
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.accountService.clearErrorMsgs();
    this.accountService.login(this.data).then(
      () => {
        this.dialogRef.close();
      },
      (error) => { }
    );
  }

  ngOnDestroy(): void {
    this.errorMsgSub.unsubscribe();
  }

}
