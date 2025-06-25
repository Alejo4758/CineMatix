// Funcionalidad principal del sitio.
// Espera a que todo el contenido HTML de la página se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function() {
    // Animaciones de scroll que se activará cuando el 10% del elemento sea visible
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Selecciona todas las tarjetas de películas y títulos de sección.
    // Inicializa su opacidad en 0 y los desplaza 30px hacia abajo.

    document.querySelectorAll('.movie-card, .section-title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Carrito de compras global
    // Maneja la lógica de añadir, eliminar, actualizar y guardar ítems del carrito.
    window.cart = {
        items: [], // Array para almacenar los ítems del carrito.
        total: 0,  // Suma total de los precios.

        // Añade un nuevo ítem al carrito, actualiza el total y lo guarda en el almacenamiento local.
        addItem: function(item) {
            this.items.push(item);
            this.updateTotal();
            this.saveToStorage();
        },

        // Elimina un ítem del carrito por su índice, actualiza el total y lo guarda.
        removeItem: function(index) {
            this.items.splice(index, 1);
            this.updateTotal();
            this.saveToStorage();
        },

        // Calcula el total sumando los precios de todos los ítems.
        updateTotal: function() {
            this.total = this.items.reduce((sum, item) => sum + item.price, 0);
        },

        // Vacía el carrito
        clear: function() {
            this.items = [];
            this.total = 0;
            this.saveToStorage();
        },

        // Guarda el estado actual del carrito en el localStorage del navegador,
        saveToStorage: function() {
            localStorage.setItem('cinematix_cart', JSON.stringify({
                items: this.items,
                total: this.total
            }));
        },

        // Carga el carrito desde el localStorage al iniciar la página.
        loadFromStorage: function() {
            const saved = localStorage.getItem('cinematix_cart');
            if (saved) {
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.total = data.total || 0;
            }
        }
    };

    // Cargar carrito desde localStorage.
    window.cart.loadFromStorage();

    // Funciones de utilidad
    window.utils = {
        // Formatea un precio a formato de moneda con dos decimales.
        formatPrice: function(price) {
            return `$${price.toFixed(2)}`;
        },

        // Formatea una fecha al formato "día, mes, año".
        formatDate: function(date) {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        // Formatea una hora al formato local de "hora:minuto".
        formatTime: function(time) {
            return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        // Muestra una notificación en la esquina superior derecha de la pantalla.
        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-card);
                color: var(--text-light);
                padding: 1rem 2rem;
                border-radius: 8px;
                border-left: 4px solid var(--accent-color);
                box-shadow: var(--shadow);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;

            // Ajusta el color del borde según el tipo de notificación.
            if (type === 'error') {
                notification.style.borderLeftColor = 'var(--primary-color)';
            } else if (type === 'success') {
                notification.style.borderLeftColor = '#28a745';
            }

            // Agrega la notificación al cuerpo del documento.
            document.body.appendChild(notification);

            // Anima la notificación para que aparezca deslizándose.
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);

            // Anima la notificación para que desaparezca después de 3 segundos.
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    };

    // Datos de películas
    // Objeto global 'moviesData' que contiene toda la información detallada de las películas.
    window.moviesData = {
        'destino-final': {
            title: 'Destino final: Lazos de sangre',
            genre: 'Terror, sobrenatural',
            duration: '110 min',
            rating: '+16',
            synopsis: 'Sigue a Stefanie, una joven que sufre pesadillas recurrentes sobre un accidente fatal en una torre de la década de 1960. Descubre que estas visiones son premoniciones conectadas con su abuela, Iris, quien logró engañar a la muerte hace 50 años. Ahora, la muerte persigue a sus descendientes, y Stefanie debe encontrar la forma de romper este ciclo mortal para salvar a su familia.',
            image: 'assets/images/pelicula2.jpg',
            showtimes: [
                { time: '14:30', room: 'Sala 1', format: '2D', price: 850.00 },
                { time: '17:00', room: 'Sala 1', format: '2D', price: 850.00 },
                { time: '20:00', room: 'Sala 2', format: '3D', price: 980.00 }
            ]
        },
        'lilo-y-stitch': {
            title: 'Lilo & Stitch',
            genre: 'Comedia, Drama',
            duration: '85 min',
            rating: 'ATP',
            synopsis: 'En el planeta Turo, el científico Jumba Jookiba crea al Experimento 626 (Stitch), una criatura destructiva. Tras su exilio, Stitch escapa y llega a la Tierra, aterrizando en Kauaʻi. Allí, Lilo, una niña hawaiana solitaria, lo adopta creyéndolo un perrito. Mientras Lilo y su hermana Nani luchan por mantener a su familia unida, Stitch, perseguido por Jumba, el agente Pleakley y las autoridades, aprende el verdadero significado de “ohana” (familia), transformándose de agente de caos en protector. Finalmente, descubre el amor por su nueva familia y encuentra su lugar junto a ellas.',
            image: 'assets/images/pelicula3.jpg',
            showtimes: [
                { time: '15:00', room: 'Sala 3', format: '2D', price: 800.00 },
                { time: '18:30', room: 'Sala 3', format: '2D', price: 800.00 },
                { time: '21:30', room: 'Sala 3', format: '2D', price: 800.00 }
            ]
        },
        'bailarina': {
            title: 'Bailarina',
            genre: 'Acción, Thriller',
            duration: '125 min',
            rating: '+18',
            synopsis: 'Eve Macarro es hija de dos asesinos del grupo Ruska Roma. Tras presenciar el asesinato de su padre, Winston la lleva con la Ruska Roma, donde la entrenan durante 12 años como bailarina y asesina encubierta bajo la tutela de la enigmática “Directora”.',
            image: 'assets/images/pelicula4.jpg',
            showtimes: [
                { time: '13:00', room: 'Sala 4', format: '2D', price: 750.00 },
                { time: '15:30', room: 'Sala 4', format: '2D', price: 750.00 },
                { time: '18:00', room: 'Sala 4', format: '2D', price: 750.00 }
            ]
        },
        'elio': {
            title: 'Elio',
            genre: 'Aventura, Ciencia ficción',
            duration: '98 min',
            rating: 'ATP',
            synopsis: 'Un niño de 11 años, obsesionado con los extraterrestres, desea con todas sus fuerzas ser abducido. De forma inesperada, resulta transportado al Communiverse, una poderosa organización interplanetaria que reúne a representantes de múltiples galaxias. Al llegar, lo confunden con el embajador de la Tierra. Ahora, Elio deberá abrir su corazón, entablar amistad con criaturas alienígenas excéntricas, enfrentar una crisis cósmica y demostrar que incluso alguien joven e inexperto puede representar lo mejor de la humanidad',
            image: 'assets/images/pelicula5.jpg',
            showtimes: [
                { time: '16:00', room: 'Sala 5', format: '2D', price: 900.00 },
                { time: '19:30', room: 'Sala 5', format: '2D', price: 900.00 },
                { time: '22:30', room: 'Sala 5', format: '2D', price: 900.00 }
            ]
        },
        '28-años-después': {
            title: '28 años después',
            genre: 'Terror, Suspenso',
            duration: '115 min',
            rating: '+18',
            synopsis: 'Han transcurrido casi tres décadas desde que un virus letal de rabia devastó el Reino Unido. Un pequeño grupo de supervivientes vive aislado en una isla fuertemente custodiada, conectada al continente por una única vía. Cuando un padre y su hijo deciden abandonar la seguridad de su refugio para explorar el territorio infectado, descubren secretos oscuros: el virus ha evolucionado, los infectados son más letales que nunca, y los humanos supervivientes también han cambiado dramáticamente.',
            image: 'assets/images/pelicula6.jpg',
            showtimes: [
                { time: '14:00', room: 'Sala 6', format: '2D', price: 780.00 },
                { time: '17:30', room: 'Sala 6', format: '2D', price: 780.00 },
                { time: '20:30', room: 'Sala 6', format: '2D', price: 780.00 }
            ]
        },
        'el-año-nuevo-que-nunca-llegó': {
            title: 'El año nuevo que nunca llegó',
            genre: 'Drama',
            duration: '138 min',
            rating: '+13',
            synopsis: 'En diciembre de 1989, doce horas antes de la revolución que derrocaría a Nicolae Ceaușescu en Rumania, seis personas comunes —un director de televisión y su hijo universitario, una actriz de teatro, un obrero, una madre anciana y un oficial de la Securitate— viven en medio de la represión, la censura y el miedo, sin saber que el cambio está cerca. Mientras la televisión estatal organiza un especial de Año Nuevo, el joven planea escapar nadando hacia Yugoslavia, un oficial traslada a su madre a un nuevo edificio, y la actriz reemplaza a una compañera desertora… Todos sus destinos se cruzan una tarde marcada por la urgencia, la tensión y el absurdo de un régimen al borde del colapso',
            image: 'assets/images/pelicula7.jpg',
            showtimes: [
                { time: '15:30', room: 'Sala 7', format: '2D', price: 920.00 },
                { time: '19:00', room: 'Sala 7', format: '3D', price: 1050.00 },
                { time: '22:00', room: 'Sala 7', format: '2D', price: 920.00 }
            ]
        },
        'como-entrenar-a-tu-dragón': {
            title: 'Como entrenar a tu dragón',
            genre: 'Fantasía, Aventura',
            duration: '125 min',
            rating: 'ATP',
            synopsis: 'En la isla de Berk, los vikingos han sido adversarios mortales de los dragones por generaciones. Hipo, hijo de Estoico el Vasto, es un joven ingenioso pero torpe, decidido a probarse como guerrero. Tras derribar un misterioso dragón Furia Nocturna, descubre que le ha hecho daño; en lugar de matarlo, lo libera y cautivado por su comportamiento bondadoso, lo llama Chimuelo y le construye una aleta protésica, lo que les permite volar juntos y forjar una amistad que desafía siglos de prejuicio.',
            image: 'assets/images/pelicula1.jpg',
            showtimes: [
                { time: '14:30', room: 'Sala 1', format: '2D', price: 850.00 },
                { time: '17:00', room: 'Sala 1', format: '2D', price: 850.00 },
                { time: '20:00', room: 'Sala 2', format: '3D', price: 980.00 }
            ]
        }
    };
});