import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';
import { UiService } from 'src/app/services/ui.service';
import { environment } from '../../../environments/environment';
import { ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {

  authAccount: Account;
  authAccountSub: Subscription;

  errorMsgs: any;
  errorMsgSub: Subscription;

  imageSelected = false;
  file: File;
  imageChangedEvent: any;
  croppedImage: any;

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
      }
    );
    this.accountService.emitAuthAccount();
    this.errorMsgSub = this.accountService.errorMsgs$.subscribe(
      (msgs: any) => {
        this.errorMsgs = msgs;
      }
    );
    this.accountService.clearErrorMsgs();
  }

  getProfileImage(): string {
    return environment.baseURL + this.authAccount.profile_image;
  }

  onCancel(): void {
    this.accountService.clearErrorMsgs();
    this.location.back();
  }

  onSave(): void {
    this.accountService.clearErrorMsgs();
    this.accountService.updateAccount(this.authAccount, this.file).then(
      () => {
        this.location.back();
      },
      (error) => { }
    );
  }

  /* Cropper function */
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.imageSelected = true;
  }
  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
    this.file = new File([base64ToFile(this.croppedImage)], this.imageChangedEvent.target.files[0].name);
  }
  imageLoaded(): void {
    /* show cropper */
  }
  cropperReady(): void {
    /* cropper ready */
  }
  loadImageFailed(): void {
    /* show message */
  }

  ngOnDestroy(): void {
    this.authAccountSub.unsubscribe();
  }

}
