// Funcionalidad para la página de detalle de película
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movie');
    
    if (!movieId || !window.moviesData[movieId]) {
        document.getElementById('movie-detail-container').innerHTML = `
            <div style="text-align: center; color: var(--text-light);">
                <h2>Película no encontrada</h2>
                <p>La película que buscas no existe o ha sido removida.</p>
                <a href="cartelera.html" class="btn">Volver a la Cartelera</a>
            </div>
        `;
        return;
    }

    const movie = window.moviesData[movieId];
    loadMovieDetail(movie);
    loadShowtimes(movie, movieId);
});

function loadMovieDetail(movie) {
    const container = document.getElementById('movie-detail-container');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <img src="${movie.image}" alt="${movie.title}" style="width: 100%; border-radius: 15px; box-shadow: var(--shadow);">
            </div>
            <div style="color: var(--text-light);">
                <h1 style="color: var(--accent-color); margin-bottom: 1rem; font-size: 2.5rem;">${movie.title}</h1>
                <p style="margin-bottom: 0.5rem;"><strong>Género:</strong> ${movie.genre}</p>
                <p style="margin-bottom: 0.5rem;"><strong>Duración:</strong> ${movie.duration}</p>
                <p style="margin-bottom: 2rem;"><strong>Clasificación:</strong> ${movie.rating}</p>
                
                <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Sinopsis</h3>
                <p style="line-height: 1.8; margin-bottom: 2rem;">${movie.synopsis}</p>
                
                <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Ver Tráiler</h3>
                <div style="background: var(--bg-card); padding: 2rem; border-radius: 10px; text-align: center;">
                    <p style="color: #ccc; margin-bottom: 1rem;">🎬 Tráiler disponible próximamente</p>
                    <button class="btn btn-secondary" disabled>Ver Tráiler</button>
                </div>
            </div>
        </div>
    `;
}

function loadShowtimes(movie, movieId) {
    const container = document.getElementById('showtimes-container');
    
    if (!movie.showtimes || movie.showtimes.length === 0) {
        container.innerHTML = '<p style="color: #ccc;">No hay horarios disponibles para esta película.</p>';
        return;
    }

    const showtimesHTML = movie.showtimes.map(showtime => `
        <div class="showtime-card" style="
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: var(--transition);
            cursor: pointer;
        " onclick="selectShowtime('${movieId}', ${JSON.stringify(showtime).replace(/"/g, '&quot;')})">
            <div style="color: var(--text-light);">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-color);">${showtime.time}</div>
                <div style="color: #ccc;">${showtime.room} (${showtime.format})</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.3rem; font-weight: bold; color: var(--text-light);">${window.utils.formatPrice(showtime.price)}</div>
                <button class="btn" style="margin-top: 0.5rem;">Seleccionar</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = showtimesHTML;

    // Agregar efectos hover
    const showtimeCards = container.querySelectorAll('.showtime-card');
    showtimeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(245, 197, 24, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

function selectShowtime(movieId, showtime) {
    // Guardar información de la selección
    const orderData = {
        movieId: movieId,
        showtime: showtime,
        date: new Date().toLocaleDateString('es-ES'),
        seats: []
    };
    
    localStorage.setItem('cinematix_order', JSON.stringify(orderData));
    
    // Redirigir a selección de asientos
    window.location.href = `seleccion-asientos.html?movie=${movieId}&time=${showtime.time}&room=${encodeURIComponent(showtime.room)}`;
}