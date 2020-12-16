import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { environment } from '../../../environments/environment';
import { UiService } from 'src/app/services/ui.service';
import { FriendRequest } from 'src/app/models/friend-request.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  watchedProfile: Account;
  watchedProfileSub: Subscription;

  friendRequests: FriendRequest[] = [];
  friendRequestsSub: Subscription;

  constructor(
    private accountService: AccountService,
    private uiService: UiService
  ) { }

  ngOnInit(): void {
    this.watchedProfileSub = this.accountService.watchedProfile$.subscribe(
      (account: Account) => {
        this.watchedProfile = account;
      }
    );
    this.accountService.emitWatchedProfile();
    this.friendRequestsSub = this.accountService.friendRequests$.subscribe(
      (next: FriendRequest[]) => {
        this.friendRequests = next;
      }
    );
    this.accountService.emitFriendRequests();
  }

  getProfileImage(): string {
    return environment.baseURL + this.watchedProfile.profile_image;
  }

  onFriends(): void {
    this.accountService.getFriendList();
    this.uiService.showFriendList();
  }

  onFriendRequest(): void {
    if (this.watchedProfile.friend_requests.length === 1) {
      // tslint:disable-next-line: no-string-literal
      this.accountService.viewProfile(this.watchedProfile.friend_requests[0]['sender']);
    } else {
      this.accountService.retrieveFriendRequests();
      this.uiService.showFriendRequests();
    }
  }

  onSendFriendRequest(): void {
    this.accountService.sendFriendRequest(this.watchedProfile.id).then(
      () => { },
      (errorMessage) => {
        /**
         * TODO:
         * Toast to tell the user that this friend request has been cancelled
         */
        this.accountService.viewProfile(this.watchedProfile.id);
      }
    );
  }

  onCancelFriendRequest(): void {
    this.accountService.cancelFriendRequest().then(
      () => {
        this.accountService.viewProfile(this.watchedProfile.id);
      },
      (error) => { }
    );
  }

  onDeclineFriendRequest(): void {
    this.accountService.retrieveFriendRequestsWithSearch(this.watchedProfile.email).then(
      () => {
        if (this.friendRequests.length !== 0) {
          this.accountService.declineFriendRequest(this.accountService.friendRequests[0].id).then(
            () => {
              this.accountService.viewProfile(this.watchedProfile.id);
            },
            (reject) => { }
          );
        } else {
          /**
           * TODO:
           * Toast to tell the user that this friend request has been cancelled
           */
          this.accountService.viewProfile(this.watchedProfile.id);
        }
      },
      () => { }
    );
  }

  onAcceptFriendRequest(): void {
    this.accountService.retrieveFriendRequestsWithSearch(this.watchedProfile.email).then(
      () => {
        if (this.friendRequests.length !== 0) {
          this.accountService.acceptFriendRequest(this.accountService.friendRequests[0].id).then(
            () => {
              this.accountService.viewProfile(this.watchedProfile.id);
            },
            (reject) => { }
          );
        } else {
          /**
           * TODO:
           * Toast to tell the user that this friend request has been cancelled
           */
          this.accountService.viewProfile(this.watchedProfile.id);
        }
      },
      () => { }
    );
  }

  onSendMessage(): void {
    console.log('onSendMessage');
  }

  onChangePassword(): void {
    console.log('On Change Password');
  }

  onEdit(): void {
    this.uiService.showProfileEdit();
  }

  onUnfriend(): void {
    this.accountService.removeFriend();
  }

  ngOnDestroy(): void {
    this.watchedProfileSub.unsubscribe();
    this.friendRequestsSub.unsubscribe();
  }

}
