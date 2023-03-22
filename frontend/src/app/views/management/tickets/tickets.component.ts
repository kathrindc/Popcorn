import { Component } from '@angular/core';
import { AuthService } from "../../../auth/auth.service";

@Component({
  selector: 'app-management',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent {
  private role: string = "";

  constructor(
    public authService: AuthService
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

}
