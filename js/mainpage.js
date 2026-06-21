function configurarFiltros() {
    const searchInput = document.getElementById('searchInput');
    const sortBtn = document.getElementById('sortBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            
            filteredPokemon = buscarPokemonsPorTermo(pokemonData, e.target.value);

            itemsToShow = 8; 
            renderizarGrid();
        });
    }

    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            currentSort = (currentSort === 'id') ? 'name' : 'id';
            
            const sortText = sortBtn.querySelector('.sort-text');
            sortText.textContent = `Ordenar por: ${currentSort === 'id' ? 'Número' : 'Nome'}`;

            filteredPokemon.sort((a, b) => 
                currentSort === 'id' ? a.id - b.id : a.name.localeCompare(b.name)
            );

            renderizarGrid();
        });
    }
}

function carregarMais() {
    itemsToShow += 16;
    renderizarGrid();
}

const carregarMaisObserver = document.querySelector("#loadMoreBtn");

if (carregarMaisObserver) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                carregarMais();
            }
        });
    }, {
        root: null,
        rootMargin: '150px', 
        threshold: 0.1
    });

    observer.observe(carregarMaisObserver);
}

inicializar();