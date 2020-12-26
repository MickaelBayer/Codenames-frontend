import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { environment } from '../../../environments/environment';
import { FriendRequest } from 'src/app/models/friend-request.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  watchedProfile: Account;
  watchedProfileSub: Subscription;

  authAccount: Account;
  authAccountSub: Subscription;

  friendRequests: FriendRequest[] = [];
  friendRequestsSub: Subscription;

  accountIdSub: Subscription;

  profileIsLoaded = false;

  styleElementsProfileImage = [
    'max-width: 250px;',
    'height: auto;',
    'border-radius: 50%;',
    'border: 1px solid black;',
    'margin: auto;'
  ];
  altProfileImage = 'profile-image';
  titleProfileImage = 'Profile image';

  constructor(
    private accountService: AccountService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.watchedProfileSub = this.accountService.watchedProfile$.subscribe(
      (account: Account) => {
        this.watchedProfile = account;
      }
    );
    this.accountService.emitWatchedProfile();
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (account: Account) => {
        this.authAccount = account;
      }
    );
    this.accountService.emitAuthAccount();

    this.accountIdSub = this.route.paramMap.subscribe(
      (params: ParamMap) => {
        if (params.has('id')) {
          this.accountService.fetchProfile(Number(params.get('id'))).then(
            () => {
              this.profileIsLoaded = true;
            },
            (error) => { }
          );
        }
      }
    );

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
    this.accountService.getFriendList(this.watchedProfile.id);
    this.router.navigate(['account', this.watchedProfile.id, 'friends-list']);
  }

  onFriendRequest(): void {
    if (this.watchedProfile.friend_requests.length === 1) {
      // if the profile we are looking has only 1 friend request,
      // we go straight to the profile of the requester
      // tslint:disable-next-line: no-string-literal
      this.accountService.fetchProfile(this.watchedProfile.friend_requests[0]['sender']);
    } else {
      // else we go to the list
      this.accountService.fetchFriendRequests(this.watchedProfile.id);
      this.router.navigate(['account', this.watchedProfile.id, 'friends-requests']);
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
        this.accountService.fetchProfile(this.watchedProfile.id);
      }
    );
  }

  onCancelFriendRequest(): void {
    this.accountService.cancelFriendRequest(this.watchedProfile.id).then(
      () => {
        this.accountService.fetchProfile(this.watchedProfile.id);
      },
      (error) => { }
    );
  }

  onDeclineFriendRequest(): void {
    this.accountService.fetchFriendRequestsWithSearch(this.authAccount.id, this.watchedProfile.email).then(
      () => {
        if (this.friendRequests.length !== 0) {
          this.accountService.declineFriendRequest(this.friendRequests[0].id).then(
            () => {
              this.accountService.fetchProfile(this.watchedProfile.id);
            },
            (reject) => { }
          );
        } else {
          /**
           * TODO:
           * Toast to tell the user that this friend request has been cancelled
           */
          this.accountService.fetchProfile(this.watchedProfile.id);
        }
      },
      () => { }
    );
  }

  onAcceptFriendRequest(): void {
    this.accountService.fetchFriendRequestsWithSearch(this.authAccount.id, this.watchedProfile.email).then(
      () => {
        if (this.friendRequests.length !== 0) {
          this.accountService.acceptFriendRequest(this.friendRequests[0].id).then(
            () => {
              this.accountService.fetchProfile(this.watchedProfile.id);
            },
            (reject) => { }
          );
        } else {
          /**
           * TODO:
           * Toast to tell the user that this friend request has been cancelled
           */
          this.accountService.fetchProfile(this.watchedProfile.id);
        }
      },
      () => { }
    );
  }

  onSendMessage(): void {
    this.chatService.findOrCreatePrivateChatRoom(this.watchedProfile.id).then(
      (value: number) => {
        this.router.navigate(['home', 'private-chat', value]);
      },
      (error) => { }
    );
  }

  onChangePassword(): void {
    console.log('On Change Password');
  }

  onEdit(): void {
    this.router.navigate(['/account', 'edit']);
  }

  onUnfriend(): void {
    this.accountService.removeFriend(this.watchedProfile.id);
  }

  ngOnDestroy(): void {
    this.watchedProfileSub.unsubscribe();
    this.authAccountSub.unsubscribe();
    this.friendRequestsSub.unsubscribe();
    this.accountIdSub.unsubscribe();
  }

}
