// Funcionalidad para la página de confirmación
document.addEventListener('DOMContentLoaded', function() {
    loadConfirmationData();
});

function loadConfirmationData() {
    const confirmationData = JSON.parse(localStorage.getItem('cinematix_confirmation') || '{}');
    
    if (Object.keys(confirmationData).length === 0) {
        document.getElementById('ticket-info').innerHTML = `
            <div class="summary-item">
                <span>No hay información de compra</span>
                <span><a href="cartelera.html" class="btn">Ir a Cartelera</a></span>
            </div>
        `;
        return;
    }

    const movie = window.moviesData[confirmationData.movieId] || {};
    const showtime = confirmationData.showtime || {};
    const seats = confirmationData.seats || [];
    const total = seats.length * (showtime.price || 0);

    const ticketInfo = document.getElementById('ticket-info');
    ticketInfo.innerHTML = `
        <div class="summary-item">
            <span>Película:</span>
            <span>${movie.title || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span>Fecha:</span>
            <span>${confirmationData.date || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span>Hora:</span>
            <span>${showtime.time || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span>Sala:</span>
            <span>${showtime.room || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span>Asientos:</span>
            <span>${seats.join(', ') || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span>Total Pagado:</span>
            <span>${window.utils.formatPrice(total)}</span>
        </div>
    `;

    // Actualizar código QR
    const qrCode = document.getElementById('qr-code');
    if (confirmationData.confirmationCode) {
        qrCode.textContent = confirmationData.confirmationCode;
    }
}

