// Validación de formulario de pago
// Espera a que todo el contenido HTML de la página se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que window.utils y la función generateId existan
    if (!window.utils) window.utils = {};

    // Definir función generateId si no está definida
    if (!window.utils.generateId) {
        window.utils.generateId = function () {
            return Math.random().toString(36).substr(2, 9); // Devuelve ID aleatorio tipo 'a9s8f3k1z'
        };
    }

    // Referencias a elementos clave del COM
    const form = document.getElementById('payment-form');
    const payButton = document.getElementById('pay-button');
    const processingMessage = document.getElementById('processing-message');

    // Cargar resumen del pedido desde localStorage
    loadOrderSummary();

    // Configurar validaciones en tiempo real para los campos del formulario
    setupFormValidation();

    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);

    // Cargar resumen visual del pedido (película, asientos, total, etc.)
    function loadOrderSummary() {
        // Carga los datos del pedido desde localStorage
        const orderData = JSON.parse(localStorage.getItem('cinematix_order') || '{}');
        const summaryContainer = document.getElementById('order-summary');
        
        // Si no hay datos guardados, mostrar mensaje
        if (Object.keys(orderData).length === 0) {
            summaryContainer.innerHTML = `
                <div class="summary-item">
                    <span>No hay información de pedido</span>
                    <span><a href="cartelera.html" class="btn btn-secondary">Ir a Cartelera</a></span>
                </div>
            `;
            return;
        }

        // Obtiene los datos específicos de la película, horario y asientos.
        const movie = window.moviesData[orderData.movieId] || {};
        const showtime = orderData.showtime || {};
        const seats = orderData.seats || [];
        const baseTotal = seats.length * (showtime.price || 0);

        // Mostrar resumen con los datos actuales
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <span>Película:</span>
                <span>${movie.title || 'N/A'}</span>
            </div>
            <div class="summary-item">
                <span>Función:</span>
                <span>${orderData.date || 'N/A'} ${showtime.time || 'N/A'} (${showtime.room || 'N/A'})</span>
            </div>
            <div class="summary-item">
                <span>Asientos:</span>
                <span>${seats.join(', ') || 'N/A'}</span>
            </div>
            <div class="summary-item">
                <span>Cantidad de Entradas:</span>
                <span>${seats.length}</span>
            </div>
            <div class="summary-item">
                <span>Total a Pagar:</span>
                <span id="final-total">${window.utils.formatPrice(baseTotal)}</span>
            </div>
        `;
    }

    // Configurar eventos input con validaciones personalizadas
    function setupFormValidation() {
        const cardNumberInput = document.getElementById('card-number');
        cardNumberInput.addEventListener('input', function(e) {
            // Formatea el número de tarjeta como XXXX XXXX XXXX XXXX
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
            validateCardNumber();
        });

        const expiryInput = document.getElementById('expiry-date');
        expiryInput.addEventListener('input', function(e) {
            // Formatear como MM/AA
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
            validateExpiryDate();
        });

        document.getElementById('cvv').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            validateCVV();
        });

        document.getElementById('cardholder-name').addEventListener('input', validateCardholderName);
        document.getElementById('email').addEventListener('input', validateEmail);
        document.getElementById('phone').addEventListener('input', validatePhone);
        document.getElementById('birth-date').addEventListener('input', validateBirthDate);
    }

    // Validación del número de tarjeta
    function validateCardNumber() {
        const input = document.getElementById('card-number');
        const error = document.getElementById('card-number-error');
        const value = input.value.replace(/\s/g, '');

        if (value.length === 0) return showFieldError(input, error, 'El número de tarjeta es obligatorio');
        if (value.length < 13 || value.length > 19) return showFieldError(input, error, 'Debe tener entre 13 y 19 dígitos');
        if (!/^\d+$/.test(value)) return showFieldError(input, error, 'Solo debe contener números');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación de fecha de vencimiento
    function validateExpiryDate() {
        const input = document.getElementById('expiry-date');
        const error = document.getElementById('expiry-date-error');
        const value = input.value;

        if (!/^\d{2}\/\d{2}$/.test(value)) return showFieldError(input, error, 'Formato inválido. Use MM/AA');

        const [month, year] = value.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (month < 1 || month > 12) return showFieldError(input, error, 'Mes inválido');
        if (year < currentYear || (year === currentYear && month < currentMonth)) return showFieldError(input, error, 'Tarjeta vencida');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación del código CVV
    function validateCVV() {
        const input = document.getElementById('cvv');
        const error = document.getElementById('cvv-error');
        const value = input.value;

        if (value.length === 0) return showFieldError(input, error, 'El CVV es obligatorio');
        if (value.length < 3 || value.length > 4) return showFieldError(input, error, 'Debe tener 3 o 4 dígitos');
        if (!/^\d+$/.test(value)) return showFieldError(input, error, 'Solo números');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación del nombre del titular de la tarjeta
    function validateCardholderName() {
        const input = document.getElementById('cardholder-name');
        const error = document.getElementById('cardholder-name-error');
        const value = input.value.trim();

        if (value.length === 0) return showFieldError(input, error, 'Nombre obligatorio');
        if (value.length < 2) return showFieldError(input, error, 'Mínimo 2 caracteres');
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return showFieldError(input, error, 'Solo letras y espacios');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación del email
    function validateEmail() {
        const input = document.getElementById('email');
        const error = document.getElementById('email-error');
        const value = input.value.trim();

        if (value.length === 0) return showFieldError(input, error, 'Correo obligatorio');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return showFieldError(input, error, 'Correo inválido');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación del teléfono (opcional)
    function validatePhone() {
        const input = document.getElementById('phone');
        const error = document.getElementById('phone-error');
        const value = input.value.trim();

        if (value.length === 0) return showFieldSuccess(input, error); // Opcional
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(value)) return showFieldError(input, error, 'Teléfono inválido');

        showFieldSuccess(input, error);
        return true;
    }

    // Validación de fecha de nacimiento (opcional)
    function validateBirthDate() {
        const input = document.getElementById('birth-date');
        const error = document.getElementById('birth-date-error');
        const value = input.value;

        if (!value) return showFieldSuccess(input, error); // Opcional

        const birthDate = new Date(value);
        const now = new Date();

        if (isNaN(birthDate)) return showFieldError(input, error, 'Fecha inválida');
        if (birthDate > now) return showFieldError(input, error, 'Fecha futura no válida');

        const age = now.getFullYear() - birthDate.getFullYear();
        if (age < 1) return showFieldError(input, error, 'Debe tener al menos 1 año');
        if (age > 150) return showFieldError(input, error, 'Edad no válida');

        showFieldSuccess(input, error);
        return true;
    }

    // Muestra error en campo con mensaje
    function showFieldError(input, errorElement, message) {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        return false;
    }

    // Marca campo como válido
    function showFieldSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        return true;
    }

    // Validar todos los campos del formulario
    function validateAllFields() {
        return [
            validateCardNumber(),
            validateExpiryDate(),
            validateCVV(),
            validateCardholderName(),
            validateEmail(),
            validatePhone(),
            validateBirthDate(),
        ].every(Boolean);
    }

    // Manejar envío del formulario
    function handleFormSubmit(e) {
        e.preventDefault();

        // Validar todos los campos antes de continuar
        if (!validateAllFields()) {
            if (window.utils.showNotification) {
                window.utils.showNotification('Por favor, corrija los errores en el formulario', 'error');
            }
            return;
        }

        // Mostrar mensaje de procesamiento y deshabilitar botón
        payButton.disabled = true;
        processingMessage.style.display = 'block';

        // Simular demora de pago (2 segundos)
        setTimeout(() => {
            const orderData = JSON.parse(localStorage.getItem('cinematix_order') || '{}');

            const confirmationData = {
                ...orderData,
                paymentData: {
                    cardNumber: document.getElementById('card-number').value,
                    cardholderName: document.getElementById('cardholder-name').value,
                    email: document.getElementById('email').value
                },
                confirmationCode: 'QR-' + window.utils.generateId().toUpperCase(), // Generar código único
                purchaseDate: new Date().toISOString()
            };

            // Guardar datos para confirmación
            localStorage.setItem('cinematix_confirmation', JSON.stringify(confirmationData));

            // Limpiar carrito y redirigir
            if (window.cart && typeof window.cart.clear === 'function') {
                window.cart.clear();
            }
            localStorage.removeItem('cinematix_order');

            // Redirigir a página de confirmación
            window.location.href = 'confirmacion.html';
        }, 2000);
    }
});