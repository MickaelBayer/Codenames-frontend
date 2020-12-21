import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { from } from 'rxjs';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicChatComponent } from './components/public-chat/public-chat.component';
import { SearchUserComponent } from './components/search-user/search-user.component';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  { path: 'account/:id/friends-requests', component: FriendRequestsComponent, canActivate: [AuthGuard] },
  { path: 'account/:id/friends-list', component: FriendListComponent, canActivate: [AuthGuard] },
  { path: 'account/edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
  { path: 'account/search', component: SearchUserComponent, canActivate: [AuthGuard] },
  { path: 'account/:id', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'home', component: PublicChatComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
