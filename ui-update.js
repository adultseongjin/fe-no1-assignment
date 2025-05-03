import { fetchPopularMovies, fetchSearchedMovies, fetchMovieDetail, fetchLikedMovies } from './api-request.js';

//새로고침시에 인기영화 전시
document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchPopularMovies();
  renderMovieCards(data.results);
});

//각 카드에 이벤트 위임
const container = document.getElementById("movieContainer");
container.addEventListener("click", async (event) => {
  const card = event.target.closest(".movie-card");
  if (card && !event.target.classList.contains("like-button")) {
    const movieId = card.getAttribute("data-movie-id");
    const movie = await fetchMovieDetail(movieId);
    showMovieModal(movie);
  }

  if (event.target.classList.contains("like-button")) {
    const card = event.target.closest(".movie-card");
    const movieId = parseInt(card.getAttribute("data-movie-id"));
    likeButton(movieId, event.target);
  }
});

//서치바를 통한 검색어 받기 후 결과에맞는 영화 전시
document.getElementById("searchButton").addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value;
  if (query) {
    const data = await fetchSearchedMovies(query);
    if (data.results.length === 0) {
      showNoResults();
    } else {
      renderMovieCards(data.results);
    }
  }
});

document.getElementById("searchInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

let debounceTimer;
document.getElementById("searchInput").addEventListener("input", function (event) {
  const query = event.target.value;
  const resultsContainer = document.getElementById("live-search-container");

  clearTimeout(debounceTimer);

  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    return;
  }

  debounceTimer = setTimeout(async () => {
    const data = await fetchSearchedMovies(query);
    resultsContainer.innerHTML = '';

    data.results.slice(0, 5).forEach(movie => {
      const item = document.createElement("div");
      item.className = "live-search-list";
      item.textContent = movie.title;
      item.addEventListener("click", () => {
        document.getElementById("searchInput").value = movie.title;
        resultsContainer.innerHTML = '';
      });
      resultsContainer.appendChild(item);
    });
  }, 500); 
});

//영화카드 렌더링
function renderMovieCards(movies) {
  const movieContainer = document.getElementById("movieContainer");
  movieContainer.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.setAttribute("data-movie-id", movie.id);
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <div class="movie-card-content">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-rating">⭐️ ${movie.vote_average}</div>
        <div class="movie-overview">${movie.overview.slice(0, 50)}...</div>
        <button class="like-button">${isLiked(movie.id) ? '❤️' : '🤍'}</button>
      </div>
    `;
    movieContainer.appendChild(card);
  });
}

function isLiked(movieId) {
  const likes = JSON.parse(localStorage.getItem('likes')) || [];
  return likes.includes(movieId);
}

function likeButton(movieId, button) {
  let likes = JSON.parse(localStorage.getItem('likes')) || [];
  if (likes.includes(movieId)) {
    likes = likes.filter(id => id !== movieId);
    button.textContent = '🤍';
  } else {
    likes.push(movieId);
    button.textContent = '❤️';
  }
  localStorage.setItem('likes', JSON.stringify(likes));
}

//검색결과가 없을 때
function showNoResults() {
  const movieContainer = document.getElementById("movieContainer");
  movieContainer.innerHTML = '<p style="color: white;">❌검색된 영화가 없습니다!</p>';
}

//모달부분
function showMovieModal(movie) {
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = `
    <h2 id="modalMovieTitle">${movie.title}</h2>
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="width:100%;">
    <p><strong>개봉일:</strong> ${movie.release_date}</p>
    <p><strong>⭐️평점:</strong> ${movie.vote_average}</p>
    <p>${movie.overview}</p>
    <button id="modal-like-button">${isLiked(movie.id) ? '❤️' : '🤍'}</button>
  `;
  document.getElementById("modal").classList.remove("hidden");
  history.pushState({ modal: true }, null);

  document.getElementById("modal-close").addEventListener("click", () => {
    closeModal();
  });

  document.getElementById("modal-like-button").addEventListener("click", (e) => {
    likeButton(movie.id, e.target);
  });
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

window.addEventListener("popstate", (event) => {
  if (!event.state || !event.state.modal) {
    closeModal();
  }
});

//좋아요한 영화목록 버튼 눌렸을 때
document.getElementById("likedListButton").addEventListener("click", async () => {
  const data = await fetchLikedMovies();
  if (data.length === 0) {
    showNoLikedMovies();
  } else {
    renderMovieCards(data);
  }
});

function showNoLikedMovies() {
  const movieContainer = document.getElementById("movieContainer");
  movieContainer.innerHTML = '<p style="color: white;">❌좋아요한 영화가 없습니다!</p>';
}