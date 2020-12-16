import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { UnRegistredAccount, UnAuthAccount, Account } from '../models/account.model';
import { FriendRequest } from '../models/friend-request.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  authAccount: Account;
  authAccount$ = new Subject<Account>();

  friendRequests: FriendRequest[] = [];
  friendRequests$ = new Subject<FriendRequest[]>();

  watchedProfile: Account;
  watchedProfile$ = new Subject<Account>();

  searchedAccounts: Account[] = [];
  searchedAccounts$ = new Subject<Account[]>();

  errorMsgs: any;
  errorMsgs$ = new Subject<any>();

  constructor(
    private httpClient: HttpClient
  ) { }

  register(unRegistredAccount: UnRegistredAccount): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post('account/register/', unRegistredAccount).subscribe(
          (response: string) => {
            const json = JSON.parse(response);
            this.setSession(json);
            resolve();
          },
          (error) => {
            this.errorMsgs = error.error;
            this.emitErrorMsgs();
            reject(error);
          }
        );
      }
    );
  }

  login(unAuthAccount: UnAuthAccount): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post('account/login/', unAuthAccount).subscribe(
          (response: string) => {
            const json = JSON.parse(response);
            this.setSession(json);
            resolve();
          },
          (error) => {
            this.errorMsgs = error.error;
            this.emitErrorMsgs();
            reject(error);
          }
        );
      }
    );
  }

  private setSession(json: any): void {
    const token = json.token;
    const payload = jwt_decode(token);
    // tslint:disable-next-line: no-string-literal
    const expiresAt = moment.unix(payload['exp'] as number);
    localStorage.setItem('token', json.token);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
    this.viewOnwProfile();
  }

  getExpiration(): moment.Moment {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);

    return moment(expiresAt);
  }

  isLoggedIn(): boolean {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  updateAccount(account: Account, image: File): Promise<void> {
    const formData = new FormData();
    formData.append('email', account.email);
    formData.append('username', account.username);
    formData.append('hide_email', JSON.stringify(account.hide_email));
    formData.append('profile_image', image);
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post('account/edit/', formData).subscribe(
          (response: string) => {
            this.authAccount = JSON.parse(response).user;
            this.emitAuthAccount();
            resolve();
          },
          (error) => {
            this.errorMsgs = error.error;
            this.emitErrorMsgs();
            reject(error);
          }
        );
      }
    );
  }

  viewOnwProfile(): void {
    this.httpClient.get('account/profile/').subscribe(
      (response: string) => {
        this.watchedProfile = JSON.parse(response).data;
        this.emitWatchedProfile();
        this.authAccount = JSON.parse(response).data;
        this.emitAuthAccount();
      },
      (error) => {
        if (error.status === 401 && error.error.detail === 'Invalid signature.') {
          localStorage.removeItem('token');
          localStorage.removeItem('expires_at');
          this.authAccount = undefined;
          this.emitAuthAccount();
          this.watchedProfile = undefined;
          this.emitWatchedProfile();
        }
      }
    );
  }

  viewProfile(profileId: number): void {
    this.httpClient.get('account/' + profileId).subscribe(
      (response: string) => {
        this.watchedProfile = JSON.parse(response).data;
        this.emitWatchedProfile();
      },
      (error) => { }
    );
  }

  logout(): void {
    this.httpClient.get('account/logout/').subscribe(
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expires_at');
        this.authAccount = undefined;
        this.emitAuthAccount();
        this.watchedProfile = undefined;
        this.emitWatchedProfile();
      },
      (error) => { }
    );
  }

  resetWatchedProfile(): void {
    this.watchedProfile = undefined;
    this.emitWatchedProfile();
  }

  searchProfiles(query: string): void {
    const params = new HttpParams().set('q', query);
    this.httpClient.get('account/search/', { params }).subscribe(
      (response: any) => {
        this.searchedAccounts = JSON.parse(response).data;
        this.emitSearchedAccounts();
      },
      (error) => { }
    );
  }

  fetchAllProfiles(): void {
    this.httpClient.get('account/all/').subscribe(
      (response: any) => {
        this.searchedAccounts = JSON.parse(response).data;
        this.emitSearchedAccounts();
      },
      (error) => { }
    );
  }

  emitAuthAccount(): void {
    this.authAccount$.next(this.authAccount);
  }

  emitWatchedProfile(): void {
    this.watchedProfile$.next(this.watchedProfile);
  }

  emitErrorMsgs(): void {
    this.errorMsgs$.next(this.errorMsgs);
  }

  emitSearchedAccounts(): void {
    this.searchedAccounts$.next(this.searchedAccounts.slice());
  }

  clearErrorMsgs(): void {
    this.errorMsgs = undefined;
    this.emitErrorMsgs();
  }

  /***** Friends Request *****/
  // tslint:disable-next-line: variable-name
  sendFriendRequest(reciever_id: number): void {
    this.httpClient.post('friend/friend-request/', { reciever_id }).subscribe(
      (response: string) => {
        this.viewProfile(reciever_id);
      },
      (error) => {
        console.log(error.error);
      }
    );
  }

  retrieveFriendRequests(): void {
    this.httpClient.get('friend/friend-request/' + this.authAccount.id + '/').subscribe(
      (response: string) => {
        this.friendRequests = JSON.parse(response).friend_requests;
        this.emitFriendRequests();
      }
    );
  }

  retrieveFriendRequestsWithSearch(query: string): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        const params = new HttpParams().set('q', query);
        this.httpClient.get('friend/friend-request/' + this.authAccount.id + '/', { params }).subscribe(
          (response: string) => {
            this.friendRequests = JSON.parse(response).friend_requests;
            this.emitFriendRequests();
            resolve();
          },
          () => {
            reject();
          }
        );
      }
    );

  }

  acceptFriendRequest(id: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get('friend/accept-friend-request/' + id + '/').subscribe(
          (response: string) => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  // tslint:disable-next-line: variable-name
  removeFriend(): void {
    this.httpClient.post('friend/friend-remove/', { reciever_user_id: this.watchedProfile.id }).subscribe(
      (response: string) => {
        this.viewProfile(this.watchedProfile.id);
      },
      (error) => { }
    );
  }

  // tslint:disable-next-line: variable-name
  declineFriendRequest(friend_request_id: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get('friend/friend-decline/' + friend_request_id + '/').subscribe(
          (response: string) => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  emitFriendRequests(): void {
    this.friendRequests$.next(this.friendRequests);
  }

}
