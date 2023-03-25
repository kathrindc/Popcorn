import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './views/home/home.component';
import { DetailComponent } from './views/detail/detail.component';
import { NavbarComponent } from './views/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';
import { SeatsComponent } from './views/seats/seats.component';
import { CartComponent } from './views/cart/cart.component';
import { JwtModule } from '@auth0/angular-jwt';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './views/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { OrdersComponent } from './views/orders/orders.component';
import { ReviewsComponent, ReviewDialog } from './views/reviews/reviews.component';
import { OrderDetailComponent } from './views/order-detail/order-detail.component';
import { ManagementComponent } from './views/management/management.component';
import {MoviesComponent} from "./views/management/movies/movies.component";
import {TheatersComponent} from "./views/management/theaters/theaters.component";
import {ScheduleComponent} from "./views/management/schedule/schedule.component";
import {TicketsComponent} from "./views/management/tickets/tickets.component";
import {MatCard, MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DetailComponent,
    NavbarComponent,
    SeatsComponent,
    CartComponent,
    LoginComponent,
    ManagementComponent,
    ProfileComponent,
    OrdersComponent,
    ReviewsComponent,
    OrderDetailComponent,
    ReviewDialog,
    MoviesComponent,
    TheatersComponent,
    ScheduleComponent,
    TicketsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('auth'),
        allowedDomains: ['popcorn-api.toast.ws']
      }
    }),
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatSliderModule,
    MatCardModule,
    MatIconModule,
    QRCodeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
