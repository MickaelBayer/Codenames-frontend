import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {

  lightTheme = false;

  authAccount: Account;
  authAccountSub: Subscription;

  constructor(
    public accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.lightTheme = localStorage.getItem('theme') === 'Light' ? true : false;
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (next: Account) => {
        this.authAccount = next;
      }
    );
    this.accountService.emitAuthAccount();
  }

  onHome(): void {
    this.router.navigate(['home']);
  }

  onSearchUser(): void {
    this.router.navigate(['account', 'search']);
  }

  onAccount(): void {
    this.router.navigate(['account', this.authAccount.id]);
  }

  storeTheme(): void {
    localStorage.setItem('theme', this.lightTheme ? 'Light' : 'Dark');
  }

  ngOnDestroy(): void {
    this.authAccountSub.unsubscribe();
  }
}
