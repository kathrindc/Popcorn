import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public password: string = '';

  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
  }

  async doLogin(event: Event) {
    event.preventDefault();

    if (await this.authService.tryLogin(this.email, this.password)) {
      this.router.navigate(['/'])
        .then(_r => console.log('Login successful, navigating to home page.'));
    }
  }
}
