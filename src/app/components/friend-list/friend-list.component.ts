import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { Account } from '../../models/account.model';
import { environment } from '../../../environments/environment';
import { UiService } from 'src/app/services/ui.service';
import { Router } from '@angular/router';

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

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
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

  getProfileImage(profile: Account): string {
    return environment.baseURL + profile.profile_image;
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
    console.log('send a message to ' + friend.username);
  }

  ngOnDestroy(): void {
    this.friendListSub.unsubscribe();
    this.watchedProfileSub.unsubscribe();
    this.authAccountSub.unsubscribe();
  }

}
