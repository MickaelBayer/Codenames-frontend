import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rejects } from 'assert';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { PrivateChat } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  displayedRoom: PrivateChat;
  displayedRoom$ = new Subject<PrivateChat>();

  privateChats: PrivateChat[] = [];
  privateChats$ = new Subject<PrivateChat[]>();

  constructor(
    private httpClient: HttpClient,
  ) { }

  fetchPrivateChats(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(environment.apiURL + 'private-chat/').subscribe(
          (response: any) => {
            this.privateChats = JSON.parse(response).private_chats;
            this.emitPrivateChats();
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  findOrCreatePrivateChatRoom(userId: number): Promise<number> {
    return new Promise(
      (resolve, reject) => {
        this.httpClient.get(environment.apiURL + 'private-chat/' + userId + '/').subscribe(
          (response: any) => {
            resolve(JSON.parse(response).room_id);
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  setdisplayedRoom(id: number): void {
    this.displayedRoom = this.privateChats.filter(value => value.id === id)[0];
    this.emitdisplayedRoom();

  }

  emitPrivateChats(): void {
    this.privateChats$.next(this.privateChats);
  }

  emitdisplayedRoom(): void {
    this.displayedRoom$.next(this.displayedRoom);
  }
}
