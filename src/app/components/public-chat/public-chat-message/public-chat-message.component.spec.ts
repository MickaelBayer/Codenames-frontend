import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicChatMessageComponent } from './public-chat-message.component';

describe('PublicChatMessageComponent', () => {
  let component: PublicChatMessageComponent;
  let fixture: ComponentFixture<PublicChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicChatMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
