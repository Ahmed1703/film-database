const url = 'https://api.themoviedb.org/3/authentication';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZGY1ZWM5OWE1MjE2NTdkMjk5ZWE5NWQ3MWU5ZWE4MSIsIm5iZiI6MTc4MTUyNzg0MC45MTkwMDAxLCJzdWIiOiI2YTJmZjUyMGM3Zjc2NTczMDJjNzg5ZTIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2lV97_EZD5KbWoeVFwRdvkU-tIF2xX59Q12_zCaxb48'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));

  searchInput.addEventListerner('input', () => {
    const query = searchInput.value.trim();
    if (query === '') {
        results.innerHTML = '';
        return;
    }
    searchMovies(query);
  });

  function showResults(movies) {
    results.innerHTML = '';
    movies.slice(0, 8).forEach(movie => {
        const year= movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
        const row = document.createElement('div');
        row.textContent = year ? `${movie.title} (${year})` : movie.title;
        results.appendChild(row);
    });
}       