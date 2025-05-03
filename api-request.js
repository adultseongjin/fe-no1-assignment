import { apiKey } from "./config.js";

export async function fetchPopularMovies() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR`);
    return await res.json();
}

export async function fetchSearchedMovies(query) {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(query)}`);
    return await res.json();
}

export async function fetchMovieDetail(movieId) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=ko-KR`);
    return await res.json();
}

export async function fetchLikedMovies() {
    const movieIds = JSON.parse(localStorage.getItem("likes")) || [];
    if (!Array.isArray(movieIds) || movieIds.length === 0) {
        return [];
    }
    const promises = movieIds.map(async id => {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ko-KR`);
        return await res.json();
    });
    return Promise.all(promises);
}