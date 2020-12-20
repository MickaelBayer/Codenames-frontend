import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';
import { UiService } from 'src/app/services/ui.service';
import { environment } from '../../../environments/environment';

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

  differ: KeyValueDiffer<string, any>;

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
    private differs: KeyValueDiffers,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchedAccountsSub = this.accountService.searchedAccounts$.subscribe(
      (next: Account[]) => {
        this.searchedAccounts = next;
      }
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
            if (item.currentValue === '') {
              this.accountService.fetchAllProfiles();
            } else {
              this.accountService.searchProfiles(item.currentValue);
            }
          }
        });
      }
    }
  }

  getProfileImage(profile: Account): string {
    return environment.baseURL + profile.profile_image;
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
    console.log('send a message to ' + account.username);
  }

  ngOnDestroy(): void {
    this.searchedAccountsSub.unsubscribe();
    this.watchedProfileSub.unsubscribe();
  }

}
