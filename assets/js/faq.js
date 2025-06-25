// Funcionalidad para la página de FAQ
document.addEventListener('DOMContentLoaded', function() {
    setupFAQInteractions();
});

function setupFAQInteractions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Cerrar todos los otros items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').classList.remove('active');
                    otherItem.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle del item actual
            if (isActive) {
                item.classList.remove('active');
                answer.classList.remove('active');
                icon.style.transform = 'rotate(0deg)';
            } else {
                item.classList.add('active');
                answer.classList.add('active');
                icon.style.transform = 'rotate(180deg)';
            }
        });
        
        // Efecto hover
        question.addEventListener('mouseenter', function() {
            if (!item.classList.contains('active')) {
                question.style.background = 'rgba(245, 197, 24, 0.1)';
            }
        });
        
        question.addEventListener('mouseleave', function() {
            if (!item.classList.contains('active')) {
                question.style.background = 'var(--secondary-color)';
            }
        });
    });
}

// Funcionalidad de búsqueda en FAQ
function initFAQSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        margin-bottom: 2rem;
        text-align: center;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar en preguntas frecuentes...';
    searchInput.className = 'form-input';
    searchInput.style.cssText = `
        max-width: 400px;
        margin: 0 auto;
        display: block;
    `;
    
    searchContainer.appendChild(searchInput);
    
    const faqContainer = document.querySelector('.faq-container');
    faqContainer.parentNode.insertBefore(searchContainer, faqContainer);
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no hay resultados
        const visibleItems = Array.from(faqItems).filter(item => item.style.display !== 'none');
        
        let noResultsMessage = document.getElementById('no-results-message');
        if (visibleItems.length === 0 && searchTerm.length > 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-results-message';
                noResultsMessage.style.cssText = `
                    text-align: center;
                    color: #ccc;
                    padding: 2rem;
                    font-style: italic;
                `;
                noResultsMessage.textContent = 'No se encontraron preguntas que coincidan con tu búsqueda.';
                faqContainer.appendChild(noResultsMessage);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    });
}

// Inicializar búsqueda en FAQ
document.addEventListener('DOMContentLoaded', function() {
    initFAQSearch();
});