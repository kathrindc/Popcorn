import { Component } from '@angular/core';
import { MovieService } from 'src/app/api/movie.service';
import Account from 'src/app/data/account';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  public account: Account | null = null;

  constructor(
    public movieService: MovieService
  ) { }

  ngOnInit(): void {
    this.movieService.getAccountInfo()
      .subscribe((account) => {this.account = account;
      console.log(this.account);});
  }
}
