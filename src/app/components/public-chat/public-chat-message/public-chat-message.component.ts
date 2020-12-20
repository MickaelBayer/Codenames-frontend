import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-public-chat-message',
  templateUrl: './public-chat-message.component.html',
  styleUrls: ['./public-chat-message.component.scss']
})
export class PublicChatMessageComponent implements OnInit {

  @Input() message: string;
  @Input() username: string;
  @Input() profileImageUrl: string;
  @Input() userId: number;
  @Input() timestamp: string;

  constructor() { }

  ngOnInit(): void { }

  getProfileImage(): string {
    return environment.baseURL + this.profileImageUrl;
  }

  goToProfile(): void {
    console.log('Go to profile ...');
  }
}
