import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from 'src/app/api/movie.service';
import MovieDetail from 'src/app/data/movieDetail';
import Showing from 'src/app/data/showing';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public movie: MovieDetail | null = null;
  public showings: Showing[] | null = null;
  
  constructor(
    public movieService: MovieService,
    public route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');

    if (id == null) {
      this.router.navigate(['/']);

      return;
    }

    this.movieService.getMovie(id)
      .subscribe((movie) => this.movie = movie);

    this.movieService.getThisWeeksShowings(id)
      .subscribe((showings) => {this.showings = showings;
      console.log(this.showings)});
  }
}
