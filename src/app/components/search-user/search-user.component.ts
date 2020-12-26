import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss']
})
export class SearchUserComponent implements OnInit, OnDestroy, DoCheck {

  searchedAccounts: Account[] = [];
  searchedAccountsSub: Subscription;

  watchedProfile: Account;
  watchedProfileSub: Subscription;

  query = '';

  listIsLoaded = false;

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
    this.searchedAccountsSub = this.accountService.searchedAccounts$.subscribe(
      (next: Account[]) => {
        this.searchedAccounts = next;
      }
    );
    this.accountService.fetchAllProfiles().then(
      () => {
        this.listIsLoaded = true;
      },
      (error) => { }
    );
    this.accountService.emitSearchedAccounts();
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
            this.listIsLoaded = false;
            if (item.currentValue === '') {
              this.accountService.fetchAllProfiles().then(
                () => {
                  this.listIsLoaded = true;
                }, (error) => { }
              );
            } else {
              this.accountService.searchProfiles(item.currentValue).then(
                () => {
                  this.listIsLoaded = true;
                }, (error) => { }
              );
            }
          }
        });
      }
    }
  }

  onAccountCard(accountId: number): void {
    this.accountService.fetchProfile(accountId).then(
      () => {
        this.router.navigate(['account', this.watchedProfile.id]);
      },
      (error) => { }
    );
  }

  onSendMessage(account: Account, event: MouseEvent): void {
    event.stopPropagation();
    this.chatService.findOrCreatePrivateChatRoom(account.id).then(
      (value: number) => {
        this.router.navigate(['home', 'private-chat', value]);
      },
      (error) => { }
    );
  }

  ngOnDestroy(): void {
    this.searchedAccountsSub.unsubscribe();
    this.watchedProfileSub.unsubscribe();
  }

}
