const params = new URLSearchParams(window.location.search);
const query = (params.get('query') || '').trim();

const searchForm = document.getElementById('searchForm');
const resultsList = document.getElementById('results-list');
const resultsTitle = document.getElementById('results-title');
const filterType = document.getElementById('filterType');
const filterGenre = document.getElementById('filterGenre');
const filterYear = document.getElementById('filterYear');
const filterRating = document.getElementById('filterRating');
const sortBy = document.getElementById('sortBy');

let allResults = [];
const genreMap = {};

searchInput.value = query;
resultsTitle.textContent = query ? `Søkeresultater for "${query}"` : 'Søk etter filmer og serier';

// Sjangerlistene brukes både til å oversette sjanger-id-er til navn og til
// å fylle sjanger-nedtrekkslisten i filtermenyen.
loadGenres().then(() => {
    if (query) {
        runSearch(query);
    } else {
        resultsList.innerHTML = '<p class="feil">Skriv inn et søkeord for å komme i gang.</p>';
    }
});

function loadGenres() {
    return Promise.all([
        fetchFromApi('/genre/movie/list?language=nb-NO'),
        fetchFromApi('/genre/tv/list?language=nb-NO')
    ])
    .then(([movies, tv]) => {
        [...movies.genres, ...tv.genres].forEach(genre => {
            genreMap[genre.id] = genre.name;
        });

        const names = [...new Set(Object.values(genreMap))].sort((a, b) => a.localeCompare(b, 'no'));
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            filterGenre.appendChild(option);
        });
    })
    .catch(err => console.error(err));
}

function runSearch(text) {
    resultsList.innerHTML = '<p class="loading">Laster inn resultater...</p>';
    const base = `/search/multi?query=${encodeURIComponent(text)}&language=nb-NO&include_adult=false`;

    Promise.all([
        fetchFromApi(`${base}&page=1`),
        fetchFromApi(`${base}&page=2`).catch(() => ({ results: [] }))
    ])
    .then(([first, second]) => {
        allResults = [...first.results, ...second.results]
            .filter(item => item.media_type !== 'person');
        render();
    })
    .catch(err => {
        console.error(err);
        resultsList.innerHTML = '<p class="feil">Noe gikk galt under søket. Sjekk nettforbindelsen og prøv igjen.</p>';
    });
}

// Filtrerer og sorterer resultatene lokalt ut fra valgene i filtermenyen.
function render() {
    let list = allResults.slice();

    if (filterType.value !== 'all') {
        list = list.filter(item => mediaType(item) === filterType.value);
    }

    if (filterGenre.value !== 'all') {
        list = list.filter(item => (item.genre_ids || []).some(id => genreMap[id] === filterGenre.value));
    }

    const fromYear = parseInt(filterYear.value, 10);
    if (!isNaN(fromYear)) {
        list = list.filter(item => {
            const year = parseInt(itemYear(item), 10);
            return !isNaN(year) && year >= fromYear;
        });
    }

    const minRating = parseFloat(filterRating.value);
    if (minRating > 0) {
        list = list.filter(item => item.vote_average >= minRating);
    }

    list = sortResults(list, sortBy.value);

    resultsList.innerHTML = '';

    if (list.length === 0) {
        resultsList.innerHTML = '<p class="feil">Ingen treff som matcher søket og filtervalgene dine.</p>';
        return;
    }

    list.forEach(item => resultsList.appendChild(buildMovieCard(item)));
}

function sortResults(list, mode) {
    const sorted = list.slice();

    if (mode === 'rating') {
        sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (mode === 'year-desc') {
        sorted.sort((a, b) => (parseInt(itemYear(b), 10) || 0) - (parseInt(itemYear(a), 10) || 0));
    } else if (mode === 'year-asc') {
        sorted.sort((a, b) => (parseInt(itemYear(a), 10) || 9999) - (parseInt(itemYear(b), 10) || 9999));
    } else if (mode === 'name') {
        sorted.sort((a, b) => itemTitle(a).localeCompare(itemTitle(b), 'no'));
    }

    return sorted;
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = searchInput.value.trim();
    if (text !== '') {
        window.location.href = `search.html?query=${encodeURIComponent(text)}`;
    }
});

[filterType, filterGenre, filterYear, filterRating, sortBy].forEach(control => {
    control.addEventListener('input', render);
});
