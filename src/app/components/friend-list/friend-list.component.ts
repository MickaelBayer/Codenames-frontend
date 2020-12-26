import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { Account } from '../../models/account.model';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss']
})
export class FriendListComponent implements OnInit, OnDestroy, DoCheck {

  friendList: Account[] = [];
  friendListSub: Subscription;

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
    private chatService: ChatService,
    private differs: KeyValueDiffers,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.friendListSub = this.accountService.friendList$.subscribe(
      (next: Account[]) => {
        this.friendList = next;
      }
    );
    this.accountService.emitFriendList();
    this.watchedProfileSub = this.accountService.watchedProfile$.subscribe(
      (next: Account) => {
        this.watchedProfile = next;
      }
    );
    this.accountService.emitWatchedProfile();
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
      }
    );
    this.accountService.emitAuthAccount();
    this.differ = this.differs.find(this).create();
  }

  ngDoCheck(): void {
    if (this.differ) {
      const change = this.differ.diff(this);
      if (change) {
        change.forEachChangedItem(item => {
          if (item.key === 'query') {
            console.log(this.query);
            if (item.currentValue === '') {
              this.accountService.getFriendList(this.watchedProfile.id);
            } else {
              this.accountService.getFriendListWithSearch(this.watchedProfile.id, item.currentValue);
            }
          }
        });
      }
    }
  }

  onFriendCard(friendId: number): void {
    this.accountService.fetchProfile(friendId).then(
      () => {
        this.router.navigate(['account', friendId]);
      }
    );
  }

  onSendMessage(friend: Account, event: MouseEvent): void {
    event.stopPropagation();
    this.chatService.findOrCreatePrivateChatRoom(friend.id).then(
      (value: number) => {
        this.router.navigate(['home', 'private-chat', value]);
      },
      (error) => { }
    );
  }

  ngOnDestroy(): void {
    this.friendListSub.unsubscribe();
    this.watchedProfileSub.unsubscribe();
    this.authAccountSub.unsubscribe();
  }

}
