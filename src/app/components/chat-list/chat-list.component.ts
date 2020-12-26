import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { PrivateChat } from 'src/app/models/chat.model';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {

  displayedRoom: PrivateChat;
  displayedRoomSub: Subscription;

  privateChats: PrivateChat[] = [];
  privateChatsSub: Subscription;

  styleElementsProfileImage = [
    'width: 33px;',
    'height: 33px;',
    'border-radius: 50%;',
  ];
  altProfileImage = 'profile-image';
  titleProfileImage = 'Go to chat';

  // TODO: Change this to be dynamic
  defautPublicChatImage = '/media/default_chat_image/chat_image.png';

  constructor(
    private router: Router,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.displayedRoomSub = this.chatService.displayedRoom$.subscribe(
      (next: PrivateChat) => {
        this.displayedRoom = next;
      }
    );
    this.chatService.emitdisplayedRoom();
    this.privateChatsSub = this.chatService.privateChats$.subscribe(
      (next: PrivateChat[]) => {
        this.privateChats = next;
      }
    );
    this.initChatListAndRedirect();
  }

  initChatListAndRedirect(): void {
    if (this.router.url === '/home' || this.router.url === '/home/public-chat') {
      this.chatService.fetchPrivateChats().then(
        () => {
          if (this.router.url === '/home') {
            if (this.displayedRoom) {
              this.router.navigate(['home', 'private-chat', this.displayedRoom.id]);
            } else {
              this.router.navigate(['home', 'public-chat']);
            }
          }
        },
        (error) => { }
      );
    }
  }

  onSelectPublicChat(): void {
    this.chatService.setdisplayedRoom(undefined);
    this.router.navigate(['home', 'public-chat']);
  }

  onSelectPrivateChat(roomId: number): void {
    this.router.navigate(['home', 'private-chat', roomId]);
  }

  ngOnDestroy(): void {
    this.displayedRoomSub.unsubscribe();
    this.privateChatsSub.unsubscribe();
  }

}
