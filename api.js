const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZGY1ZWM5OWE1MjE2NTdkMjk5ZWE5NWQ3MWU5ZWE4MSIsIm5iZiI6MTc4MTUyNzg0MC45MTkwMDAxLCJzdWIiOiI2YTJmZjUyMGM3Zjc2NTczMDJjNzg5ZTIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2lV97_EZD5KbWoeVFwRdvkU-tIF2xX59Q12_zCaxb48'
  }
};

const CACHE_DURATION = 600000; // 10 minutter

// Prøver å hente svaret fra cache først, og henter fra APIet kun hvis
// cachen er tom eller utløpt. Reduserer belastningen på themoviedb.org.
function fetchFromApi(endpoint) {
    const key = `tmdb:${endpoint}`;
    const cached = localStorage.getItem(key);

    if (cached) {
        const entry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION) {
            return Promise.resolve(entry.data);
        }
    }

    return fetch(`${API_BASE}${endpoint}`, options)
        .then(res => {
            if (res.status === 429) {
                throw new Error('For mange forespørsler mot APIet. Prøv igjen om litt.');
            }
            if (!res.ok) {
                throw new Error(`Kunne ikke koble til themoviedb.org (${res.status}).`);
            }
            return res.json();
        })
        .then(data => {
            localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        });
}

function posterUrl(path, size) {
    return path ? `${IMG_BASE}/${size}${path}` : '';
}

function mediaType(item) {
    return item.media_type || (item.first_air_date || item.name && !item.title ? 'tv' : 'movie');
}

function itemTitle(item) {
    return item.title || item.name || 'Uten tittel';
}

function itemYear(item) {
    const date = item.release_date || item.first_air_date;
    return date ? date.slice(0, 4) : 'N/A';
}

function itemRating(item) {
    return item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
}

// Bygger et kort-element som brukes både på hovedsiden og søkeresultatsiden.
function buildMovieCard(item) {
    const type = mediaType(item);
    const title = itemTitle(item);
    const poster = posterUrl(item.poster_path, 'w500');

    const card = document.createElement('article');
    card.className = 'movie-card';

    const cover = document.createElement('div');
    cover.className = 'movie-poster';
    cover.setAttribute('role', 'img');
    cover.setAttribute('aria-label', `Plakat for ${title}`);
    if (poster) {
        cover.style.backgroundImage = `url(${poster})`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
    }

    const name = document.createElement('h4');
    name.className = 'movie-title';
    name.textContent = title;

    const info = document.createElement('p');
    info.className = 'movie-info';
    info.innerHTML = `${itemYear(item)} &middot; <i class="fa-solid fa-star" aria-hidden="true"></i> ${itemRating(item)}`;

    const button = document.createElement('button');
    button.className = 'more-bttn';
    button.textContent = 'Mer info';
    button.addEventListener('click', () => {
        window.location.href = `details.html?type=${type}&id=${item.id}`;
    });

    card.appendChild(cover);
    card.appendChild(name);
    card.appendChild(info);
    card.appendChild(button);
    return card;
}
