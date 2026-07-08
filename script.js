const searchForm = document.getElementById('searchForm');

// Fyller de tre seksjonene på hovedsiden med data direkte fra APIet.
loadSection('/movie/now_playing?language=nb-NO&region=NO&page=1', 'newest-list');
loadSection('/movie/popular?language=nb-NO&region=NO&page=1', 'popular-list');
loadSection('/tv/popular?language=nb-NO&page=1', 'tv-list');

function loadSection(endpoint, containerId) {
    const container = document.getElementById(containerId);

    fetchFromApi(endpoint)
        .then(data => {
            container.innerHTML = '';
            data.results.slice(0, 8).forEach(item => {
                container.appendChild(buildMovieCard(item));
            });
        })
        .catch(err => {
            container.innerHTML = '<p class="feil">Kunne ikke laste inn akkurat nå. Prøv igjen senere.</p>';
            console.error(err);
        });
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query !== '') {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query === '') {
        results.innerHTML = '';
        results.style.display = 'none';
        return;
    }
    searchMovies(query);
});

function searchMovies(query) {
    const endpoint = `/search/multi?query=${encodeURIComponent(query)}&language=nb-NO&include_adult=false`;

    fetchFromApi(endpoint)
        .then(data => showResults(data.results))
        .catch(err => console.error(err));
}

function showResults(movies) {
    results.innerHTML = '';

    const filtered = (movies || []).filter(movie => movie.media_type !== 'person');

    if (filtered.length === 0) {
        results.style.display = 'none';
        return;
    }

    results.style.display = 'block';
    filtered.slice(0, 8).forEach(movie => {
        const title = itemTitle(movie);

        const poster = document.createElement('img');
        poster.className = 'result-poster';
        poster.alt = `Plakat for ${title}`;
        if (movie.poster_path) {
            poster.src = posterUrl(movie.poster_path, 'w92');
        }

        const text = document.createElement('span');
        text.textContent = `${title} (${itemYear(movie)})`;

        const row = document.createElement('div');
        row.setAttribute('role', 'option');
        row.appendChild(poster);
        row.appendChild(text);
        row.addEventListener('click', () => {
            window.location.href = `details.html?type=${mediaType(movie)}&id=${movie.id}`;
        });
        results.appendChild(row);
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        results.style.display = 'none';
    }
});
