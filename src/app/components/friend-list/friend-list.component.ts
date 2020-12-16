import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { Account } from '../../models/account.model';
import { environment } from '../../../environments/environment';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss']
})
export class FriendListComponent implements OnInit, OnDestroy, DoCheck {

  friendList: Account[] = [];
  friendListSub: Subscription;

  query = '';

  differ: KeyValueDiffer<string, any>;

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
    private differs: KeyValueDiffers,
  ) { }

  ngOnInit(): void {
    this.friendListSub = this.accountService.friendList$.subscribe(
      (next: Account[]) => {
        this.friendList = next;
      }
    );
    this.accountService.emitFriendList();
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
              this.accountService.getFriendList();
            } else {
              this.accountService.getFriendListWithSearch(item.currentValue);
            }
          }
        });
      }
    }
  }

  getProfileImage(profile: Account): string {
    return environment.baseURL + profile.profile_image;
  }

  onSendMessage(friend: Account, event: MouseEvent): void {
    event.stopPropagation();
    console.log('send a message to ' + friend.username);
  }

  ngOnDestroy(): void {
    this.friendListSub.unsubscribe();
  }

}