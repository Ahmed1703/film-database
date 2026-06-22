const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZGY1ZWM5OWE1MjE2NTdkMjk5ZWE5NWQ3MWU5ZWE4MSIsIm5iZiI6MTc4MTUyNzg0MC45MTkwMDAxLCJzdWIiOiI2YTJmZjUyMGM3Zjc2NTczMDJjNzg5ZTIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2lV97_EZD5KbWoeVFwRdvkU-tIF2xX59Q12_zCaxb48'
  }
};

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
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=nb-NO&include_adult=false`;

    fetch(url, options)
        .then(res => res.json())
        .then(json => showResults(json.results))
        .catch(err => console.error(err));
}

function showResults(movies) {
    results.innerHTML = '';

    if (!movies || movies.length === 0) {
        results.style.display = 'none';
        return;
    }

    results.style.display = 'block';
    movies.slice(0, 8).forEach(movie => {
        const title = movie.title || movie.name;
        const date = movie.release_date || movie.first_air_date;
        const year = date ? date.slice(0, 4) : 'N/A';

        const row = document.createElement('div');
        row.textContent = year ? `${title} (${year})` : title;
        row.addEventListener('click', () => {
            searchInput.value = title;
            results.innerHTML = '';
            results.style.display = 'none';
        });
        results.appendChild(row);
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        results.style.display = 'none';
    }
});
