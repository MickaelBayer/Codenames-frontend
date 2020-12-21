import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-preloader',
  templateUrl: './image-preloader.component.html',
  styleUrls: ['./image-preloader.component.scss']
})
export class ImagePreloaderComponent implements OnInit, OnChanges {

  @Input() alt: string;
  @Input() imgUrl: string;
  @Input() title: string;
  @Input() styleElements: string[];

  defaultImgUrl = 'assets/img/profile_image.png';

  imgFullUrl: string;

  isLoaded = false;

  constructor() { }

  ngOnInit(): void {
    this.imgFullUrl = environment.baseURL + this.imgUrl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.imgUrl) {
      this.isLoaded = false;
      this.imgFullUrl = environment.baseURL + changes.imgUrl.currentValue;
    }
  }

  getStyleValues(): string {
    let styleValues = '';
    if (this.styleElements) {
      this.styleElements.forEach(element => {
        styleValues += element;
      });
    }
    return styleValues;
  }

  onLoad(): void {
    this.isLoaded = true;
  }

}
