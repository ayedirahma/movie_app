import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { envrionment } from '../../environments/environment';
import { Movie } from '../interfaces/movie';
import { Observable } from 'rxjs';
import { MovieResponse } from '../interfaces/movie-response';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn:'root'
})

export class MovieService {
    private readonly http= inject(HttpClient)
    private readonly url=environment.url_api
    private readonly key= envrionment.api_key
    private readonly movieUrl=environment.url_movie_api
    private readonly wishListStorageKey = 'movie_wishlist';

    public movieList=signal<Movie[]>([]);
    public selectedMovie=signal<Movie | null>(null);
    public wishList = signal<Movie[]>(this.loadWishList());

    getMovieList():Observable<Movie[]>{
        return this.http.get<MovieResponse>(`${this.url}?api_key=${this.key}`).pipe(
            map(response => response.results)
        )

    }
    getMovieById(id:number){
        return this.http.get<Movie>(`${this.movieUrl}/${id}?api_key=${this.key}`).pipe(
            map(response => response)
        )
    }

    addToWishList(movie: Movie): void {
        const currentWishList = this.wishList()
        if (currentWishList.some(savedMovie => savedMovie.id === movie.id)) {
            return
        }

        const updatedWishList = [...currentWishList, movie]
        this.persistWishList(updatedWishList)
        this.wishList.set(updatedWishList)
    }

    removeFromWishList(movieId: number): void {
        const updatedWishList = this.wishList().filter(movie => movie.id !== movieId)
        this.persistWishList(updatedWishList)
        this.wishList.set(updatedWishList)
    }

    isInWishList(movieId: number): boolean {
        return this.wishList().some(movie => movie.id === movieId)
    }

    private loadWishList(): Movie[] {
        if (typeof localStorage === 'undefined') {
            return []
        }

        const storedWishList = localStorage.getItem(this.wishListStorageKey)
        if (!storedWishList) {
            return []
        }

        try {
            const parsedWishList: unknown = JSON.parse(storedWishList)
            if (!Array.isArray(parsedWishList)) {
                throw new Error('Stored wishlist must be an array.')
            }

            return parsedWishList.filter((movie): movie is Movie => {
                if (typeof movie !== 'object' || movie === null) {
                    return false
                }

                const candidate = movie as Partial<Movie>
                return typeof candidate.id === 'number' && typeof candidate.title === 'string'
            })
        } catch (error) {
            console.error('Could not read the saved wishlist from local storage.', error)
            return []
        }
    }
    private persistWishList(movies: Movie[]): void {
    if (typeof localStorage === 'undefined') {
        return;
    }
    localStorage.setItem(this.wishListStorageKey, JSON.stringify(movies));
}

}
