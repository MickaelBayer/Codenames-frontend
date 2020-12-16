import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UnRegistredAccount } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-sign-in-dialog',
  templateUrl: './sign-in-dialog.component.html',
  styleUrls: ['./sign-in-dialog.component.scss']
})
export class SignInDialogComponent implements OnInit, OnDestroy {

  errorMsgs: any;
  errorMsgSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<SignInDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnRegistredAccount,
    public accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.data = new UnRegistredAccount(undefined, undefined, undefined);
    this.errorMsgSub = this.accountService.errorMsgs$.subscribe(
      (msgs: any) => {
        this.errorMsgs = msgs;
      }
    );
  }

  getErrorsKeys(): string[] {
    return Object.keys(this.errorMsgs);
  }

  onNoClick(): void {
    this.accountService.clearErrorMsgs();
    this.dialogRef.close();
  }

  onRegisterClick(): void {
    this.accountService.clearErrorMsgs();
    this.accountService.register(this.data).then(
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
