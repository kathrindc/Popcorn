import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';
import { CartComponent } from './views/cart/cart.component';
import { DetailComponent } from './views/detail/detail.component';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { SeatsComponent } from './views/seats/seats.component';

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
  path:'login',
  pathMatch: 'full',
  component: LoginComponent,
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
