import {Component, ViewChild} from '@angular/core';
import {AuthService} from "../../../../auth/auth.service";
import {MovieService} from "../../../../api/movie.service";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import Seat from "../../../../data/seat";
import {TheaterCreate} from "../../../../data/theater-create";
import {Theater} from "../../../../data/theater";

@Component({
  selector: 'app-management',
  templateUrl: './theaters-create.component.html',
  styleUrls: ['./theaters-create.component.scss']
})
export class TheatersCreateComponent {
  private role: string = "";
  public theaterForm: FormGroup;

  //for updating theater
  public theaterId: string | null = null;
  private theater: TheaterCreate | undefined;

  public featureList: string[] = ['3D', 'IMAX', '2D', 'Dolby Atmos'];
  public selectedFeatures: string[] = [];


  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.theaterForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.selectedFeatures = [];
  }

  ngOnInit() {
    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {
      }
    });

    this.theaterForm = this.fb.group({
      name: ['', Validators.required],
    });

    var id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieService.getTheater(id).subscribe({
        next: (data)  => {
          this.theaterId = id;
          this.theater = data;

          this.selectedFeatures = data.features;
          this.theaterForm.patchValue({
            name: data.name,
          })
        },
        error: (err) => {
          this.theaterId = null;
        }
      });

    }

  }

  toggleFeatureSelection(feature: string): void {
    const index = this.selectedFeatures.indexOf(feature);

    if (index >= 0) {
      this.selectedFeatures.splice(index, 1);
    } else {
      this.selectedFeatures.push(feature);
    }
    console.log(this.featureList);
    console.log(this.selectedFeatures);
  }


  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  back() {
    this.location.back();
  }

  onSubmit() {
    if (this.theaterForm.valid) {

      //different wether it is update or create
      if (this.theaterId) {
        const theater: Theater = {
          id: this.theaterId,
          name: this.theaterForm.get('name')?.value,
          features: this.selectedFeatures,
        };

        this.movieService.updateTheater(theater).subscribe({
          next: (theater) => {
            this.router.navigate(['/management/theaters']).then(() => {
              this.snackBar.open('Theater created successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the theater', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      } else {
        const theaterCreate: TheaterCreate = {
          name: this.theaterForm.get('name')?.value,
          features: this.selectedFeatures,
        };

        this.movieService.createTheater(theaterCreate).subscribe({
          next: (theater) => {
            this.router.navigate(['/management/theaters']).then(() => {
              this.snackBar.open('Theater created successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the theater', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      }

    }
  }


}
