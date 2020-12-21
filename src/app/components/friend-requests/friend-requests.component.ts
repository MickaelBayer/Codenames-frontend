import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { Account } from '../../models/account.model';
import { KeyValueDiffer } from '@angular/core';
import { KeyValueDiffers } from '@angular/core';
import { FriendRequest } from 'src/app/models/friend-request.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss']
})
export class FriendRequestsComponent implements OnInit, OnDestroy, DoCheck {

  friendRequests: FriendRequest[] = [];
  friendRequestsSub: Subscription;

  authAccount: Account;
  authAccountSub: Subscription;

  watchedProfile: Account;
  watchedProfileSub: Subscription;

  query = '';

  differ: KeyValueDiffer<string, any>;

  styleElementsProfileImage = [
    'height: 50px;',
    'border-radius: 50%;',
    'border: 1px solid black;',
    'margin: auto 0;'
  ];
  altProfileImage = 'profile-image';

  constructor(
    public accountService: AccountService,
    private differs: KeyValueDiffers,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.friendRequestsSub = this.accountService.friendRequests$.subscribe(
      (next: FriendRequest[]) => {
        this.friendRequests = next;
      }
    );
    this.accountService.emitFriendRequests();
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
      }
    );
    this.accountService.emitAuthAccount();
    this.watchedProfileSub = this.accountService.watchedProfile$.subscribe(
      (next: Account) => {
        this.watchedProfile = next;
      }
    );
    this.accountService.emitWatchedProfile();
    this.differ = this.differs.find(this).create();
  }

  ngDoCheck(): void {
    if (this.differ) {
      const change = this.differ.diff(this);
      if (change) {
        change.forEachChangedItem(item => {
          if (item.key === 'query') {
            if (item.currentValue === '') {
              this.accountService.fetchFriendRequests(this.authAccount.id);
            } else {
              this.accountService.fetchFriendRequestsWithSearch(this.authAccount.id, item.currentValue);
            }
          }
        });
      }
    }
  }

  onProfileCard(friendRequest: FriendRequest): void {
    this.accountService.fetchProfile(friendRequest.sender.id).then(
      () => {
        this.router.navigate(['account', this.watchedProfile.id]);
      },
      (error) => { }
    );
  }

  onAcceptFriendRequest(friendRequestId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.accountService.acceptFriendRequest(friendRequestId).then(
      () => {
        if (this.query !== '') {
          this.accountService.fetchFriendRequestsWithSearch(this.authAccount.id, this.query).then(
            () => { }, () => { }
          );
        } else {
          this.accountService.fetchFriendRequests(this.authAccount.id);
        }
      },
      (reject) => {
        /**
         * TODO:
         * Toast to tell the user that this friend request has been cancelled
         */
        this.accountService.fetchFriendRequests(this.authAccount.id);
      }
    );
  }

  // tslint:disable-next-line: variable-name
  onDeclineFriendRequest(friendRequestId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.accountService.declineFriendRequest(friendRequestId).then(
      () => {
        if (this.query !== '') {
          this.accountService.fetchFriendRequestsWithSearch(this.authAccount.id, this.query).then(
            () => { }, () => { }
          );
        } else {
          this.accountService.fetchFriendRequests(this.authAccount.id);
        }
      },
      (error) => {
        /**
         * TODO:
         * Toast to tell the user that this friend request has been cancelled by him
         */
        this.accountService.fetchFriendRequests(this.authAccount.id);
      }
    );
  }

  ngOnDestroy(): void {
    this.friendRequestsSub.unsubscribe();
    this.authAccountSub.unsubscribe();
    this.watchedProfileSub.unsubscribe();
  }

}
