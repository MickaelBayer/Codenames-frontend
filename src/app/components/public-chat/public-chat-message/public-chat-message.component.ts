import { Component, Input, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';

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

  styleElementsProfileImage = [
    'width: 33px;',
    'height: 33px;',
    'border-radius: 50%;',
  ];
  altProfileImage = 'profile-image';
  titleProfileImage = 'Go to profile';

  splittedMessage: string[] = [];


  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.splittedMessage = this.message.split('\n');
  }

  goToProfile(userId: number): void {
    // open in a new tab
    this.accountService.fetchProfile(userId).then(
      () => {
        window.open(window.location.origin + '/account/' + userId, '_blank');
      },
      (error) => { }
    );
  }

}
