import { Component } from '@angular/core';
import { AuthService } from "../../auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent {
  private role: string = "";

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {
        //TODO: error handling
      }
    });
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  navigateToTheaters() {
    this.router.navigate(['management/theaters']);
  }

  navigateToMovies() {
    this.router.navigate(['management/movies']);
  }

  navigateToSchedule() {
    this.router.navigate(['management/schedule']);
  }

  navigateToTickets() {
    this.router.navigate(['management/tickets']);
  }

}
