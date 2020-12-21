import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { UnRegistredAccount, UnAuthAccount, Account } from '../models/account.model';
import { FriendRequest } from '../models/friend-request.model';
import { environment } from 'src/environments/environment';

const apiUrlPrefix = environment.apiURL;

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

  friendList: Account[] = [];
  friendList$ = new Subject<Account[]>();

  errorMsgs: any;
  errorMsgs$ = new Subject<any>();

  constructor(
    private httpClient: HttpClient
  ) {
    // set the cookie for the sockets authentification if a session is stored in the local storage
    try {
      document.cookie = 'authorization=bearer ' + localStorage.getItem('token') + ';'
        + localStorage.getItem('expires_at') + ';path=/';
    } catch (error) {
      console.log(error);
    }
  }

  register(unRegistredAccount: UnRegistredAccount): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post(apiUrlPrefix + 'account/register/', unRegistredAccount).subscribe(
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
        this.httpClient.post(apiUrlPrefix + 'account/login/', unAuthAccount).subscribe(
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
    // set this in a coockie for websocket authentification
    document.cookie = 'authorization=bearer ' + localStorage.getItem('token') + ';'
      + localStorage.getItem('expires_at') + ';path=/';
    this.fetchOnwProfile();
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
    if (image) {
      formData.append('profile_image', image);
    }

    return new Promise(
      (resolve, reject) => {
        this.httpClient.post(apiUrlPrefix + 'account/edit/', formData).subscribe(
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

  fetchOnwProfile(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(apiUrlPrefix + 'account/profile/').subscribe(
          (response: string) => {
            this.authAccount = JSON.parse(response).data;
            this.emitAuthAccount();
            resolve();
          },
          (error) => {
            if (error.status === 401 && error.error.detail === 'Invalid signature.') {
              localStorage.removeItem('token');
              localStorage.removeItem('expires_at');
              this.authAccount = undefined;
              this.emitAuthAccount();
              this.watchedProfile = undefined;
              this.emitWatchedProfile();
              reject(error);
            }
          }
        );
      }
    );

  }

  fetchProfile(profileId: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(apiUrlPrefix + 'account/' + profileId).subscribe(
          (response: string) => {
            this.watchedProfile = JSON.parse(response).data;
            this.emitWatchedProfile();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  logout(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(apiUrlPrefix + 'account/logout/').subscribe(
          () => {
            localStorage.removeItem('token');
            localStorage.removeItem('expires_at');
            this.authAccount = undefined;
            this.emitAuthAccount();
            this.watchedProfile = undefined;
            this.emitWatchedProfile();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  resetWatchedProfile(): void {
    this.watchedProfile = undefined;
    this.emitWatchedProfile();
  }

  searchProfiles(query: string): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        const params = new HttpParams().set('q', query);
        this.httpClient.get(apiUrlPrefix + 'account/search/', { params }).subscribe(
          (response: any) => {
            this.searchedAccounts = JSON.parse(response).data;
            this.emitSearchedAccounts();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  fetchAllProfiles(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(apiUrlPrefix + 'account/all/').subscribe(
          (response: any) => {
            this.searchedAccounts = JSON.parse(response).data;
            this.emitSearchedAccounts();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
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
  sendFriendRequest(reciever_id: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post(apiUrlPrefix + 'friend/friend-request/', { reciever_id }).subscribe(
          (response: string) => {
            this.fetchProfile(reciever_id);
            resolve();
          },
          (error) => {
            reject(JSON.parse(error.error).message);
          }
        );
      }
    );
  }

  fetchFriendRequests(accountId: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(apiUrlPrefix + 'friend/friend-request/' + accountId + '/').subscribe(
          (response: string) => {
            this.friendRequests = JSON.parse(response).friend_requests;
            this.emitFriendRequests();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  fetchFriendRequestsWithSearch(accountId: number, query: string): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        const params = new HttpParams().set('q', query);
        this.httpClient.get(apiUrlPrefix + 'friend/friend-request/' + accountId + '/', { params }).subscribe(
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
        this.httpClient.get(apiUrlPrefix + 'friend/accept-friend-request/' + id + '/').subscribe(
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
  removeFriend(accountId: number): void {
    this.httpClient.post(apiUrlPrefix + 'friend/friend-remove/', { reciever_user_id: accountId }).subscribe(
      (response: string) => {
        this.fetchProfile(this.watchedProfile.id);
      },
      (error) => { }
    );
  }

  // tslint:disable-next-line: variable-name
  declineFriendRequest(friendRequestId: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get('friend/friend-decline/' + friendRequestId + '/').subscribe(
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

  cancelFriendRequest(accountId: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.post(apiUrlPrefix + 'friend/friend-cancel/', { reciever_id: accountId }).subscribe(
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

  getFriendList(accountId: number): void {
    this.httpClient.get(apiUrlPrefix + 'friend/list/' + accountId + '/').subscribe(
      (response: string) => {
        this.friendList = JSON.parse(response).friends;
        this.emitFriendList();
      },
      (error) => { }
    );
  }

  getFriendListWithSearch(accountId: number, query: string): void {
    const params = new HttpParams().set('q', query);
    this.httpClient.get(apiUrlPrefix + 'friend/list/' + accountId + '/', { params }).subscribe(
      (response: string) => {
        this.friendList = JSON.parse(response).friends;
        this.emitFriendList();
      },
      (error) => { }
    );
  }

  emitFriendRequests(): void {
    this.friendRequests$.next(this.friendRequests);
  }

  emitFriendList(): void {
    this.friendList$.next(this.friendList.slice());
  }
}
