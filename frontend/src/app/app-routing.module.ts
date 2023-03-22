import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';
import { CartComponent } from './views/cart/cart.component';
import { DetailComponent } from './views/detail/detail.component';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { OrderDetailComponent } from './views/order-detail/order-detail.component';
import { OrdersComponent } from './views/orders/orders.component';
import { ProfileComponent } from './views/profile/profile.component';
import { ReviewsComponent } from './views/reviews/reviews.component';
import { SeatsComponent } from './views/seats/seats.component';
import {ManagementComponent} from "./views/management/management.component";
import {MoviesComponent} from "./views/management/movies/movies.component";
import {ScheduleComponent} from "./views/management/schedule/schedule.component";
import {TicketsComponent} from "./views/management/tickets/tickets.component";
import {TheatersComponent} from "./views/management/theaters/theaters.component";

const routes: Routes = [

{
  path:'',
  pathMatch: 'full',
  component: HomeComponent,
},
{
  path:'movies/:id',
  pathMatch: 'full',
  component: DetailComponent,
},
{
  path:'shows/:showId/:theaterId',
  pathMatch: 'full',
  component: SeatsComponent,
  canActivate: [AuthGuard]
},
{
  path:'cart',
  pathMatch: 'full',
  component: CartComponent,
  canActivate: [AuthGuard]
},
{
  path:'profile',
  pathMatch: 'full',
  component: ProfileComponent,
  canActivate: [AuthGuard]
},
{
  path:'orders',
  pathMatch: 'full',
  component: OrdersComponent,
  canActivate: [AuthGuard]
},
{
  path:'orders/:id',
  pathMatch: 'full',
  component: OrderDetailComponent,
  canActivate: [AuthGuard]
},
{
  path:'reviews',
  pathMatch: 'full',
  component: ReviewsComponent,
  canActivate: [AuthGuard]
},
{
  path:'login',
  pathMatch: 'full',
  component: LoginComponent,
},
{
  path:'management',
  pathMatch: 'full',
  component: ManagementComponent,
},
{
  path:'management/theaters',
  pathMatch: 'full',
  component: TheatersComponent,
},
{
  path:'management/movies',
  pathMatch: 'full',
  component: MoviesComponent,
},
{
  path:'management/schedule',
  pathMatch: 'full',
  component: ScheduleComponent,
},
{
  path:'management/tickets',
  pathMatch: 'full',
  component: TicketsComponent,
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
