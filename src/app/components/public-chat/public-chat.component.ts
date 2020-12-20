import {
  AfterViewChecked,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { environment } from '../../../environments/environment';
import { PublicChatMessageComponent } from './public-chat-message/public-chat-message.component';
import { Account } from '../../models/account.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.scss']
})
export class PublicChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('publicChatLog', { read: ViewContainerRef }) publicChatLog: ViewContainerRef;
  @ViewChild('publicChatScrollContainer') scrollContainer: ElementRef;

  wsScheme = 'ws';
  wsPath: string;

  roomId = 1;

  publicChatSocket: WebSocket;

  message = '';
  noMessageError: string;

  authAccount: Account;
  authAccountSub: Subscription;

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private accountService: AccountService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.accountService.viewOnwProfile();
    this.authAccountSub = this.accountService.authAccount$.subscribe(
      (value: Account) => {
        const oldAuthAccount = this.authAccount;
        this.authAccount = value;
        if (this.authAccount !== oldAuthAccount || !this.authAccount) {
          this.initWebSocket();
        }
      }
    );
  }

  ngAfterViewChecked(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (error) { console.log(error); }
  }

  initWebSocket(): void {
    // on login reload WS ?!
    if (this.publicChatSocket) {
      this.publicChatSocket.close();
    }
    this.wsScheme = window.location.protocol === 'https' ? 'wss' : 'ws';
    this.wsPath = this.wsScheme + '://' + window.location.host.split(':')[0] + ':' + environment.wsPort + '/public-chat/' + this.roomId + '/';
    this.publicChatSocket = new WebSocket(this.wsPath);
    this.publicChatSocket.addEventListener('open', () => {
      console.log('Public Chat Socket OPEN');
      // join the chat room
      if (this.accountService.isLoggedIn()) {
        this.publicChatSocket.send(JSON.stringify({
          command: 'join',
          room_id: this.roomId
        }));
      }
    });
    this.publicChatSocket.onmessage = (message) => {
      console.log('Public Chat Socket message');
      const data = JSON.parse(message.data);
      if (data.error) {
        this.showErrorToast(data);
      }
      if (data.message_type === 0) {
        this.appendChatMessage(data);
      }
    };
    this.publicChatSocket.onopen = () => { console.log('Public Chat Socket OPEN'); };
    this.publicChatSocket.onclose = () => { console.log('Public Chat Socket CLOSED'); };
    this.publicChatSocket.onerror = (e) => { console.log('Public Chat Socket ERROR: '); console.log(e); };
    if (this.publicChatSocket.readyState === WebSocket.OPEN) {
      console.log('Public Chat Socket OPEN');
    } else if (this.publicChatSocket.readyState === WebSocket.CONNECTING) {
      console.log('Public Chat Socket CONNECTING');
    }
  }

  onSendMessage(): void {
    const data = JSON.stringify({
      command: 'send',
      message: this.message,
      room_id: this.roomId
    });
    this.publicChatSocket.send(data);
    this.message = '';
  }

  appendChatMessage(data: any): void {
    const msg = data.message + '\n';
    const username = data.username;
    const userId = data.userId;
    const profileImage = data.profile_image;
    const timestamp = data.timestamp;
    this.createChatMessageElement(msg, username, userId, profileImage, timestamp);
  }

  createChatMessageElement(msg: string, username: string, userId: number, profileImage: string, timestamp: string): void {
    const factory = this.factoryResolver.resolveComponentFactory(PublicChatMessageComponent);
    const inserted = this.publicChatLog.createComponent(factory);
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
    //   viewContainerRef: this.publicChatLog,
    //   panelClass: 'error-snackbar'
    // });
  }

  ngOnDestroy(): void {
    this.authAccountSub.unsubscribe();
    this.publicChatSocket.close();
  }
}
