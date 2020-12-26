import {
  AfterViewChecked,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { environment } from '../../../environments/environment';
import { Account } from '../../models/account.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatService } from 'src/app/services/chat.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PrivateChat } from 'src/app/models/chat.model';
import { PrivateChatMessageComponent } from './private-chat-message/private-chat-message.component';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss']
})
export class PrivateChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('privateChatLog', { read: ViewContainerRef }) privateChatLog: ViewContainerRef;
  @ViewChild('privateChatScrollContainer') scrollContainer: ElementRef;

  wsScheme = 'ws';
  wsPath: string;

  room: PrivateChat;
  roomSub: Subscription;

  connectedUserCount = 0;

  pageNumber = 1;
  scrollToBottom = true;
  isPaginationExhausted = false;

  privateChatSocket: WebSocket;

  message = '';
  noMessageError: string;

  authAccount: Account;
  authAccountSub: Subscription;

  chatIdSub: Subscription;

  styleElementsProfileImage = [
    'width: 33px;',
    'height: 33px;',
    'border-radius: 50%;',
  ];
  altProfileImage = 'chat-image';

  // TODO: Change this to be dynamic
  defautPrivateChatImage = '/media/default_chat_image/chat_image.png';

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (value: Account) => {
        const oldAuthAccount = this.authAccount;
        this.authAccount = value;
      }
    );
    this.roomSub = this.chatService.displayedRoom$.subscribe(
      (next: PrivateChat) => {
        this.room = next;
        if (this.room) {
          this.initWebSocket();
        }
      }
    );
    this.chatService.emitdisplayedRoom();
    this.chatIdSub = this.route.paramMap.subscribe(
      (params: ParamMap) => {
        if (params.has('id')) {
          this.chatService.fetchPrivateChats().then(
            () => {
              this.chatService.setdisplayedRoom(Number(params.get('id')));
            }, (error) => { }
          );
        }
      }
    );
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (error) {
        // console.log(error);
      }
    }
  }

  initWebSocket(): void {
    // on login reload WS ?!
    if (this.privateChatSocket) {
      this.privateChatSocket.close();
    }
    this.pageNumber = 1;
    this.scrollToBottom = true;
    if (this.privateChatLog) {
      this.privateChatLog.clear();
    }
    this.wsScheme = window.location.protocol === 'https' ? 'wss' : 'ws';
    this.wsPath = this.wsScheme + '://' + window.location.host.split(':')[0] + ':' + environment.wsPort + '/private-chat/' + this.room.id + '/';
    this.privateChatSocket = new WebSocket(this.wsPath);
    this.privateChatSocket.addEventListener('open', () => {
      console.log('Private Chat Socket OPEN');
      // join the chat room
      if (this.accountService.isLoggedIn()) {
        this.privateChatSocket.send(JSON.stringify({
          command: 'join',
          room_id: this.room.id
        }));
      }
    });
    this.privateChatSocket.onmessage = (message) => {
      console.log('Private Chat Socket message');
      const data = JSON.parse(message.data);
      if (data.error) {
        this.showErrorToast(data);
      }
      if (data.message_type === 0) {
        this.appendChatMessage(data, true);
      } else if (data.message_type === 1) {
        this.connectedUserCount = data.connected_user_count;
      }
      if (data.join) {
        this.getRoomChatMessages();
        console.log(data.username + ' joined the room');
      }
      if (data.messages_payload) {
        const oldScrollHeight = (this.scrollContainer.nativeElement as HTMLElement).scrollHeight;
        this.handleMessagesPayload(data.messages, data.new_page_number).then(
          () => {
            (this.scrollContainer.nativeElement as HTMLElement).scrollTo(0,
              this.scrollContainer.nativeElement.scrollHeight - oldScrollHeight);
          },
          () => { }
        );
      }
    };
    this.privateChatSocket.onopen = () => { console.log('Private Chat Socket OPEN'); };
    this.privateChatSocket.onclose = () => { console.log('Private Chat Socket CLOSED'); };
    this.privateChatSocket.onerror = (e) => { console.log('Private Chat Socket ERROR: '); /* console.log(e); */ };
    if (this.privateChatSocket.readyState === WebSocket.OPEN) {
      console.log('Private Chat Socket OPEN');
    } else if (this.privateChatSocket.readyState === WebSocket.CONNECTING) {
      console.log('Private Chat Socket CONNECTING');
    }
  }

  onSendMessage(): void {
    const data = JSON.stringify({
      command: 'send',
      message: this.message,
      room_id: this.room.id
    });
    this.privateChatSocket.send(data);
    this.message = '';
  }

  onScroll(event: any): void {
    this.scrollToBottom = this.scrollContainer.nativeElement.scrollHeight
      === Math.round(this.scrollContainer.nativeElement.scrollTop)
      + this.scrollContainer.nativeElement.offsetHeight;
    if (this.scrollContainer.nativeElement.scrollTop <= 5 && this.privateChatSocket.readyState === WebSocket.OPEN) {
      this.getRoomChatMessages();
    }
  }

  setPageNumber(pageNumber: number): void {
    this.pageNumber = pageNumber;
  }

  setPaginationExhausted(): void {
    this.setPageNumber(-1);
    this.isPaginationExhausted = true;
  }

  getRoomChatMessages(): void {
    if (this.pageNumber !== -1) {
      const pageNumber = this.pageNumber;
      this.setPageNumber(-1);  // query is in progress
      this.privateChatSocket.send(JSON.stringify({
        command: 'get_chatroom_messages',
        room_id: this.room.id,
        page_number: pageNumber
      }));
    }
  }

  handleMessagesPayload(messages, newPageNumber: number): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        if (messages !== null && messages !== 'undefined') {
          this.pageNumber = newPageNumber;
          messages.forEach((message) => {
            this.appendChatMessage(message, false);
          });
          resolve();
        } else {
          this.setPaginationExhausted();
          reject();
        }
      }
    );
  }

  appendChatMessage(data: any, isNewMessage: boolean): void {
    const msg = data.message;
    const username = data.username;
    const userId = data.user_id;
    const profileImage = data.profile_image;
    const timestamp = data.timestamp;
    this.createChatMessageElement(msg, username, userId, profileImage, timestamp, isNewMessage);
  }

  createChatMessageElement(
    msg: string,
    username: string,
    userId: number,
    profileImage: string,
    timestamp: string,
    isNewMessage: boolean
  ): void {
    const factory = this.factoryResolver.resolveComponentFactory(PrivateChatMessageComponent);
    let inserted: ComponentRef<PrivateChatMessageComponent>;
    const oldScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    const oldTopPlusOffset = Math.round(this.scrollContainer.nativeElement.scrollTop) + this.scrollContainer.nativeElement.offsetHeight;
    if (isNewMessage) {
      inserted = this.privateChatLog.createComponent(factory);
      if (oldScrollHeight === oldTopPlusOffset) {
        this.scrollToBottom = true;
      }
    } else {
      inserted = this.privateChatLog.createComponent(factory, 0);
    }
    inserted.instance.message = msg;
    inserted.instance.username = username;
    inserted.instance.userId = userId;
    inserted.instance.profileImageUrl = profileImage;
    inserted.instance.timestamp = timestamp;
  }

  showErrorToast(data: any): void {
    this.noMessageError = data.message;
    setTimeout(() => {
      this.noMessageError = undefined;
    }, 2000);
    // this.snackBar.open(data.message, null, {
    //   duration: 222000,
    //   horizontalPosition: 'center',
    //   verticalPosition: 'top',
    //   viewContainerRef: this.privateChatLog,
    //   panelClass: 'error-snackbar'
    // });
  }

  ngOnDestroy(): void {
    this.chatIdSub.unsubscribe();
    this.authAccountSub.unsubscribe();
    this.roomSub.unsubscribe();
    if (this.privateChatSocket) {
      this.privateChatSocket.close();
    }
  }
}
