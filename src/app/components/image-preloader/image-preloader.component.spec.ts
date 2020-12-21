import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePreloaderComponent } from './image-preloader.component';

describe('ImagePreloaderComponent', () => {
  let component: ImagePreloaderComponent;
  let fixture: ComponentFixture<ImagePreloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagePreloaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagePreloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
