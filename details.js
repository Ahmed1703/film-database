const detailParams = new URLSearchParams(window.location.search);
const type = detailParams.get('type') === 'tv' ? 'tv' : 'movie';
const id = detailParams.get('id');

const main = document.getElementById('detail-main');

if (!id) {
    main.innerHTML = '<p class="feil">Fant ingen film eller serie å vise.</p>';
} else {
    loadDetails();
}

function loadDetails() {
    Promise.all([
        fetchFromApi(`/${type}/${id}?append_to_response=credits,similar&language=nb-NO`),
        fetchFromApi(`/${type}/${id}/videos?language=en-US`).catch(() => ({ results: [] }))
    ])
    .then(([data, videos]) => {
        // Norsk synopsis mangler ofte, så vi henter en engelsk beskrivelse som reserve.
        if (!data.overview) {
            return fetchFromApi(`/${type}/${id}?language=en-US`)
                .then(fallback => render(data, videos, fallback.overview))
                .catch(() => render(data, videos, ''));
        }
        return render(data, videos, data.overview);
    })
    .catch(err => {
        console.error(err);
        main.innerHTML = '<p class="feil">Kunne ikke hente informasjon akkurat nå. Prøv igjen senere.</p>';
    });
}

function render(data, videos, overview) {
    const title = itemTitle(data);
    const year = itemYear(data);
    const rating = itemRating(data);

    main.innerHTML = `
        <a class="back-bttn" id="backLink" href="index.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Tilbake</a>

        <div class="detail-hero">
            <div class="detail-poster">
                <img id="d-poster" alt="">
            </div>
            <div class="detail-body">
                <h1 id="d-title"></h1>
                <p class="detail-meta" id="d-meta"></p>
                <div class="detail-genres" id="d-genres"></div>
                <h2 class="detail-label">Sammendrag</h2>
                <p class="detail-overview" id="d-overview"></p>
                <p class="detail-crew" id="d-crew"></p>
            </div>
        </div>

        <section class="detail-cast" id="d-cast-section">
            <h2 class="detail-label">Rollebesetning</h2>
            <div class="cast-list" id="d-cast"></div>
        </section>

        <section class="detail-trailer" id="d-trailer-section">
            <h2 class="detail-label">Trailer</h2>
            <div class="trailer-wrap" id="d-trailer"></div>
        </section>

        <section class="movies-section shade-2" id="d-similar-section">
            <div class="section-head">
                <h2><i class="fa-solid fa-clapperboard" aria-hidden="true"></i> Lignende</h2>
            </div>
            <div class="movie-list" id="d-similar"></div>
        </section>
    `;

    document.getElementById('backLink').addEventListener('click', (e) => {
        if (document.referrer) {
            e.preventDefault();
            history.back();
        }
    });

    const poster = document.getElementById('d-poster');
    if (data.poster_path) {
        poster.src = posterUrl(data.poster_path, 'w500');
        poster.alt = `Plakat for ${title}`;
    } else {
        poster.alt = `Ingen plakat tilgjengelig for ${title}`;
    }

    document.getElementById('d-title').textContent = `${title} (${year})`;
    document.getElementById('d-meta').innerHTML = buildMeta(data, rating);
    document.getElementById('d-overview').textContent = overview || 'Ingen beskrivelse tilgjengelig.';

    buildGenres(data.genres);
    buildCrew(data);
    buildCast(data.credits);
    buildTrailer(videos.results);
    buildSimilar(data.similar);
}

function buildMeta(data, rating) {
    const parts = [`<i class="fa-solid fa-star" aria-hidden="true"></i> ${rating}`];

    if (type === 'movie' && data.runtime) {
        parts.push(`${data.runtime} min`);
    }
    if (type === 'tv' && data.number_of_seasons) {
        parts.push(`${data.number_of_seasons} sesong${data.number_of_seasons > 1 ? 'er' : ''}`);
    }

    const date = data.release_date || data.first_air_date;
    if (date) {
        parts.push(date);
    }

    return parts.join(' &middot; ');
}

function buildGenres(genres) {
    const container = document.getElementById('d-genres');
    (genres || []).forEach(genre => {
        const chip = document.createElement('span');
        chip.className = 'genre-chip';
        chip.textContent = genre.name;
        container.appendChild(chip);
    });
}

function buildCrew(data) {
    const container = document.getElementById('d-crew');

    if (type === 'movie') {
        const directors = (data.credits.crew || [])
            .filter(person => person.job === 'Director')
            .map(person => person.name);
        if (directors.length) {
            container.innerHTML = `<strong>Regi:</strong> ${directors.join(', ')}`;
        }
    } else {
        const creators = (data.created_by || []).map(person => person.name);
        if (creators.length) {
            container.innerHTML = `<strong>Skaper:</strong> ${creators.join(', ')}`;
        }
    }
}

function buildCast(credits) {
    const container = document.getElementById('d-cast');
    const cast = (credits && credits.cast ? credits.cast : []).slice(0, 8);

    if (cast.length === 0) {
        document.getElementById('d-cast-section').style.display = 'none';
        return;
    }

    cast.forEach(person => {
        const card = document.createElement('div');
        card.className = 'cast-card';

        const photo = document.createElement('img');
        photo.className = 'cast-photo';
        photo.alt = `Bilde av ${person.name}`;
        if (person.profile_path) {
            photo.src = posterUrl(person.profile_path, 'w185');
        }

        const name = document.createElement('p');
        name.className = 'cast-name';
        name.textContent = person.name;

        const role = document.createElement('p');
        role.className = 'cast-role';
        role.textContent = person.character || '';

        card.appendChild(photo);
        card.appendChild(name);
        card.appendChild(role);
        container.appendChild(card);
    });
}

function buildTrailer(videos) {
    const section = document.getElementById('d-trailer-section');
    const wrap = document.getElementById('d-trailer');

    const trailer = (videos || []).find(video => video.site === 'YouTube' && video.type === 'Trailer')
        || (videos || []).find(video => video.site === 'YouTube' && video.type === 'Teaser');

    if (!trailer) {
        section.style.display = 'none';
        return;
    }

    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube.com/embed/${trailer.key}`;
    frame.title = 'Trailer';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    wrap.appendChild(frame);
}

function buildSimilar(similar) {
    const section = document.getElementById('d-similar-section');
    const container = document.getElementById('d-similar');
    const items = (similar && similar.results ? similar.results : []).filter(item => item.poster_path).slice(0, 8);

    if (items.length === 0) {
        section.style.display = 'none';
        return;
    }

    items.forEach(item => {
        item.media_type = type;
        container.appendChild(buildMovieCard(item));
    });
}
