import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HeaderComponent } from './components/header/header.component';
import { SignInDialogComponent } from './components/header/sign-in-dialog/sign-in-dialog.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './services/api-interceptor';
import { LoginDialogComponent } from './components/header/login-dialog/login-dialog.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AccountService } from './services/account.service';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { ThemeSwitchComponent } from './components/theme-switch/theme-switch.component';
import { UiService } from './services/ui.service';
import { SearchUserComponent } from './components/search-user/search-user.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SignInDialogComponent,
    LoginDialogComponent,
    ProfileComponent,
    SideNavComponent,
    ThemeSwitchComponent,
    SearchUserComponent,
    ProfileEditComponent,
    FriendRequestsComponent
  ],
  imports: [
    AppMaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ImageCropperModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    AccountService,
    UiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
