import { Component, OnDestroy, OnInit, DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
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

  query = '';

  differ: KeyValueDiffer<string, any>;

  constructor(
    public accountService: AccountService,
    public uiService: UiService,
    private differs: KeyValueDiffers,
  ) { }

  ngOnInit(): void {
    this.searchedAccountsSub = this.accountService.searchedAccounts$.subscribe(
      (next: Account[]) => {
        this.searchedAccounts = next;
      }
    );
    this.accountService.fetchAllProfiles();
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

  searchProfile(inputValue: string): void {
    console.log(inputValue);
  }

  getProfileImage(profile: Account): string {
    return environment.baseURL + profile.profile_image;
  }

  ngOnDestroy(): void {
    this.searchedAccountsSub.unsubscribe();
  }

}
