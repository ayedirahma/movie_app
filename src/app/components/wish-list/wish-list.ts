import { Component, inject } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../services/movie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-wish-list',
  styleUrl: './wish-list.css',
  templateUrl: './wish-list.html',
})
export class WishList {
  readonly movieService = inject(MovieService)

  removeFromWishList(movieId: number): void {
    this.movieService.removeFromWishList(movieId)
  }
}
