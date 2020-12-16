import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {

  authAccount: Account;
  authAccountSub: Subscription;

  showProfileComponent = false;
  showProfileComponentSub: Subscription;

  showProfileEditComponent = false;
  showProfileEditComponentSub: Subscription;

  showSearchUserComponent = false;
  showSearchUserComponentSub: Subscription;

  showFriendRequestsComponent = false;
  showFriendRequestsComponentSub: Subscription;

  constructor(
    public uiService: UiService,
    public accountService: AccountService,
  ) { }

  ngOnInit(): void {
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
      }
    );
    this.accountService.emitAuthAccount();
    this.showProfileComponentSub = this.uiService.showProfileComponent$.subscribe(
      (next: boolean) => {
        this.showProfileComponent = next;
      }
    );
    this.uiService.emitShowProfileComponent();
    this.showSearchUserComponentSub = this.uiService.showSearchUserComponent$.subscribe(
      (next: boolean) => {
        this.showSearchUserComponent = next;
      }
    );
    this.uiService.emitShowSearchUserComponent();
    this.showProfileEditComponentSub = this.uiService.showProfileEditComponent$.subscribe(
      (next: boolean) => {
        this.showProfileEditComponent = next;
      }
    );
    this.uiService.emitShowProfileEditComponent();
    this.showFriendRequestsComponentSub = this.uiService.showFriendRequestsComponent$.subscribe(
      (next: boolean) => {
        this.showFriendRequestsComponent = next;
      }
    );
    this.uiService.emitShowFriendRequestComponent();
  }

  ngOnDestroy(): void {
    this.showProfileComponentSub.unsubscribe();
    this.showSearchUserComponentSub.unsubscribe();
    this.authAccountSub.unsubscribe();
    this.showProfileEditComponentSub.unsubscribe();
    this.showFriendRequestsComponentSub.unsubscribe();
  }
}
