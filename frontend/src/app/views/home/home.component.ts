import { Component, OnInit } from '@angular/core';
import { MovieService } from 'src/app/api/movie.service';
import Page from 'src/app/api/page';
import MovieBasic from 'src/app/data/movieBasic';

@Component({
  selector: 'view-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public list: Page<MovieBasic> | null = null;

  constructor(
    public movieService: MovieService
  ) { }

  ngOnInit(): void {
    this.movieService.listMovie(1,10,true)
      .subscribe((list) => {this.list = list;
      console.log(this.list);});
  }
}
