function getCardStep(container) {
    const card = container.querySelector('.pokemon-card-container');
    if (!card) return 0;

    const estilo = getComputedStyle(container);
    const gap = parseFloat(estilo.columnGap || estilo.gap) || 0;

    return card.offsetWidth + gap;
}

async function carregarDestaquesIndex() {
    const container = document.getElementById('pokemon-list');
    if (!container) return;

    const destaques = [25, 2, 5, 8, 1, 4, 7, 10, 12];

    for (let id of destaques) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const p = await res.json();
            renderizarCard({
                name: p.name, id: p.id, hp: p.stats[0].base_stat,
                attack: p.stats[1].base_stat, defense: p.stats[2].base_stat,
                type: p.types.map(t => t.type.name),
                moves: p.moves.slice(0, 2).map(m => m.move.name),
                image: p.sprites.other['official-artwork'].front_default
            }, container, false);
        } catch (e) { console.error(e); }
    }

    const cards = [...container.children];
    const numClones = 4;

    for (let i = 0; i < numClones; i++) {
        container.appendChild(cards[i].cloneNode(true));
    }
    for (let i = 0; i < numClones; i++) {
        container.insertBefore(cards[cards.length - 1 - i].cloneNode(true), container.firstChild);
    }

    container.scrollLeft = getCardStep(container) * numClones;

    container.addEventListener('scroll', () => {
        const step = getCardStep(container);
        const scrollPos = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (scrollPos >= maxScroll - 5) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = step * numClones;
        } else if (scrollPos <= 5) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = maxScroll - (step * numClones);
        }
    });

    window.addEventListener('resize', () => {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = getCardStep(container) * numClones;
    });
}

function scrollCarousel(direction) {
    const container = document.getElementById('pokemon-list');
    if (!container) return;

    const step = getCardStep(container);
    container.style.scrollBehavior = 'smooth';
    container.scrollLeft += step * direction;
}

inicializar();