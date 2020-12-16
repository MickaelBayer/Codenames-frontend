import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { Account } from '../../models/account.model';
import { environment } from '../../../environments/environment';
import { KeyValueDiffer } from '@angular/core';
import { KeyValueDiffers } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { FriendRequest } from 'src/app/models/friend-request.model';


@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss']
})
export class FriendRequestsComponent implements OnInit, OnDestroy, DoCheck {

  friendRequests: FriendRequest[] = [];
  friendRequestsSub: Subscription;

  query = '';

  differ: KeyValueDiffer<string, any>;

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
    private differs: KeyValueDiffers,
  ) { }

  ngOnInit(): void {
    this.friendRequestsSub = this.accountService.friendRequests$.subscribe(
      (next: FriendRequest[]) => {
        this.friendRequests = next;
      }
    );
    this.accountService.emitFriendRequests();
    this.differ = this.differs.find(this).create();
  }

  ngDoCheck(): void {
    if (this.differ) {
      const change = this.differ.diff(this);
      if (change) {
        change.forEachChangedItem(item => {
          if (item.key === 'query') {
            if (item.currentValue === '') {
              this.accountService.retrieveFriendRequests();
            } else {
              this.accountService.retrieveFriendRequestsWithSearch(item.currentValue);
            }
          }
        });
      }
    }
  }

  getProfileImage(profile: Account): string {
    return environment.baseURL + profile.profile_image;
  }

  onAcceptFriendRequest(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.accountService.acceptFriendRequest(id).then(
      () => {
        if (this.query !== '') {
          this.accountService.retrieveFriendRequestsWithSearch(this.query).then(
            () => { }, () => { }
          );
        } else {
          this.accountService.retrieveFriendRequests();
        }
      },
      (reject) => { }
    );
  }

  // tslint:disable-next-line: variable-name
  onDeclineFriendRequest(friend_request_id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.accountService.declineFriendRequest(friend_request_id).then(
      () => {
        if (this.query !== '') {
          this.accountService.retrieveFriendRequestsWithSearch(this.query).then(
            () => { }, () => { }
          );
        } else {
          this.accountService.retrieveFriendRequests();
        }
      },
      (error) => { }
    );
  }

  ngOnDestroy(): void {
    this.friendRequestsSub.unsubscribe();
  }

}
