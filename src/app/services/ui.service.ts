import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Account } from '../models/account.model';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  showProfileComponent = false;
  showProfileComponent$ = new Subject<boolean>();

  showProfileEditComponent = false;
  showProfileEditComponent$ = new Subject<boolean>();

  showSearchUser = false;
  showSearchUserComponent$ = new Subject<boolean>();

  showFriendRequestsComponent = false;
  showFriendRequestsComponent$ = new Subject<boolean>();

  authAccount: Account;
  authAccoutSub: Subscription;

  constructor(
    public accountService: AccountService
  ) {
    // return to home on logout
    this.authAccoutSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
        if (next === undefined) {
          this.returnToHome();
        }
      }
    );
    this.accountService.emitAuthAccount();
  }

  showHome(): void {
    this.returnToHome();
  }

  showOwnProfile(): void {
    this.hideAllComponents();
    this.accountService.viewOnwProfile();
    this.showProfileComponent = true;
    this.emitShowProfileComponent();
  }

  showProfile(id: number): void {
    this.hideAllComponents();
    this.accountService.viewProfile(id);
    this.showProfileComponent = true;
    this.emitShowProfileComponent();
  }

  showProfileEdit(): void {
    this.hideAllComponents();
    this.showProfileEditComponent = true;
    this.emitShowProfileEditComponent();
  }

  showSearchUserComponent(): void {
    this.hideAllComponents();
    this.showSearchUser = true;
    this.emitShowSearchUserComponent();
  }

  showFriendRequests(): void {
    this.hideAllComponents();
    this.showFriendRequestsComponent = true;
    this.emitShowFriendRequestComponent();
  }

  returnToHome(): void {
    this.hideAllComponents();
  }

  hideAllComponents(): void {
    this.showProfileComponent = false;
    this.emitShowProfileComponent();
    this.showSearchUser = false;
    this.emitShowSearchUserComponent();
    this.showProfileEditComponent = false;
    this.emitShowProfileEditComponent();
    this.showFriendRequestsComponent = false;
    this.emitShowFriendRequestComponent();
  }

  emitShowProfileComponent(): void {
    // if we hide the profile component, we also set the watchedProfile to undefined
    // to avoid last profile watched to show on the next call to profile component
    if (!this.showProfileComponent) {
      this.accountService.resetWatchedProfile();
    }
    this.showProfileComponent$.next(this.showProfileComponent);
  }

  emitShowProfileEditComponent(): void {
    this.showProfileEditComponent$.next(this.showProfileEditComponent);
  }

  emitShowSearchUserComponent(): void {
    this.showSearchUserComponent$.next(this.showSearchUser);
  }

  emitShowFriendRequestComponent(): void {
    this.showFriendRequestsComponent$.next(this.showFriendRequestsComponent);
  }

}
