import { Component } from '@angular/core';
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent {
  private role: string | undefined;

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

  hasRole(role: string): boolean {
    return this.role === role;
  }

}
