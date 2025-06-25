/**
 * Funcionalidad para la selección de asientos
 * Espera a que todo el contenido HTML de a página se cargue antes de ejecutar el script
 */
document.addEventListener('DOMContentLoaded', function() {
    // Carga los datos del pedido de la función desde el localStorage
    const orderData = JSON.parse(localStorage.getItem('cinematix_order') || '{}');
    
    if (Object.keys(orderData).length === 0) {
        window.location.href = 'cartelera.html';
        return;
    }

    // Carga y muestra las información de la película y horario
    loadFunctionInfo(orderData);
    // Genera el mapa de asientos
    generateSeatMap();
    // Configuración de los eventos para la selección
    setupSeatSelection();
    // Actualiza el resumen de asientos seleccionados y el precio total
    updateSummary();
});

// Función para mostrar la información y el horario de la película
function loadFunctionInfo(orderData) {
    const movie = window.moviesData[orderData.movieId] || {};
    const showtime = orderData.showtime || {};
    
    const functionInfo = document.getElementById('function-info');
    functionInfo.innerHTML = `
        <div style="background: var(--bg-card); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color);">
            <strong>${movie.title || 'N/A'}</strong> - ${orderData.date || 'N/A'} ${showtime.time || 'N/A'} (${showtime.room || 'N/A'})
        </div>
    `;
}

// Función para generar visualmente el mapa de asientos
function generateSeatMap() {
    const container = document.getElementById('seats-container');
    const rows = 8; // 8 filas
    const seatsPerRow = 10; // 10 asientos por fila
    
    // Generar asientos ocupados aleatoriamente
    const occupiedSeats = generateOccupiedSeats(rows, seatsPerRow);
    
    let seatHTML = ''; // HTML de todos los asientos
    
    // Itera para crear cada fila y asiento
    for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
        
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            // ID único para cada asiento
            const seatId = `${rowLetter}${seat}`;
            // Verifica si el asiento actual está ocupado
            const isOccupied = occupiedSeats.includes(seatId);
            const seatClass = isOccupied ? 'occupied' : 'available';
            
            seatHTML += `
                <div class="seat ${seatClass}" 
                     data-seat-id="${seatId}" 
                     data-row="${rowLetter}" 
                     data-number="${seat}"
                     ${!isOccupied ? 'onclick="toggleSeat(this)"' : ''}>
                    ${seatId}
                </div>
            `;
        }
    }
    
    container.innerHTML = seatHTML;
}

// Función para generar una lista aleatoria de asientos ocupados
function generateOccupiedSeats(rows, seatsPerRow) {
    const occupied = []; 
    const totalSeats = rows * seatsPerRow;
    const occupiedCount = Math.floor(totalSeats * 0.3); // 30% ocupados
    
    // Seleccionar asientos aleatorios hasta alcanzar el número deseado
    while (occupied.length < occupiedCount) {
        const row = Math.floor(Math.random() * rows);
        const seat = Math.floor(Math.random() * seatsPerRow) + 1;
        const seatId = `${String.fromCharCode(65 + row)}${seat}`;
        
        if (!occupied.includes(seatId)) {
            occupied.push(seatId);
        }
    }
    
    return occupied;
}

// Función para configurar los eventos de interacción de la página
function setupSeatSelection() {
    const continueButton = document.getElementById('continue-payment');
    
    continueButton.addEventListener('click', function() {
        const selectedSeats = getSelectedSeats();
        
        if (selectedSeats.length === 0) {
            window.utils.showNotification('Debe seleccionar al menos un asiento', 'error');
            return;
        }
        
        // Actualizar datos del pedido
        const orderData = JSON.parse(localStorage.getItem('cinematix_order') || '{}');
        orderData.seats = selectedSeats;
        localStorage.setItem('cinematix_order', JSON.stringify(orderData));
        
        // Redirigir a pago
        window.location.href = 'pago.html';
    });
}

// Función para alternar la selección de un asiento (seleccionado/disponible)
function toggleSeat(seatElement) {
    // Asiento ocupado: No es seleccionable
    if (seatElement.classList.contains('occupied')) {
        return;
    }
    
    const maxSeats = 8; // Máximo 8 asientos por compra
    const selectedSeats = document.querySelectorAll('.seat.selected');
    
    if (seatElement.classList.contains('selected')) {
        // Deseleccionar asiento
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        // Seleccionar asiento
        if (selectedSeats.length >= maxSeats) {
            window.utils.showNotification(`Máximo ${maxSeats} asientos por compra`, 'error');
            return;
        }
        
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }
    
    // Actualizar resumen del pedido.
    updateSummary();
}

// Obtener los IDs de todos los asientos seleccionados
function getSelectedSeats() {
    const selectedElements = document.querySelectorAll('.seat.selected');
    return Array.from(selectedElements).map(seat => seat.dataset.seatId);
}

// Actualiza el resumen de la selección de asientos y el precio total
function updateSummary() {
    const selectedSeats = getSelectedSeats();
    const orderData = JSON.parse(localStorage.getItem('cinematix_order') || '{}');
    const showtime = orderData.showtime || {};
    const pricePerSeat = showtime.price || 0;
    const total = selectedSeats.length * pricePerSeat;
    
    // Actualizar elementos del resumen
    document.getElementById('selected-seats-count').textContent = selectedSeats.length;
    document.getElementById('selected-seats-list').textContent = 
        selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguno';
    document.getElementById('total-price').textContent = window.utils.formatPrice(total);
    
    // Habilitar/deshabilitar botón de continuar
    const continueButton = document.getElementById('continue-payment');
    continueButton.disabled = selectedSeats.length === 0;
    
    if (selectedSeats.length > 0) {
        continueButton.style.opacity = '1';
        continueButton.style.cursor = 'pointer';
    } else {
        continueButton.style.opacity = '0.6';
        continueButton.style.cursor = 'not-allowed';
    }
}