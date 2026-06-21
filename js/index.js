let numReaisCarrossel = 0;
let numClonesCarrossel = 0;
let listenersCarrosselAtivos = false;

function getCardStep(container) {
    const card = container.querySelector('.pokemon-card-container');
    if (!card) return 0;

    const estilo = getComputedStyle(container);
    const gap = parseFloat(estilo.columnGap || estilo.gap) || 0;

    return card.offsetWidth + gap;
}

async function montarDestaques(container) {
    const destaquesDia = [25, 2, 5, 8, 1, 4, 7, 10, 12];
    const destaquesNoite = [94, 197, 169, 200, 229, 198, 215, 164, 92];

    const modoNoturno = configuracoes.temaEscuro === true;
    const destaques = modoNoturno ? destaquesNoite : destaquesDia;

    if (pokemonData.length === 0) {
        await carregarPokedex();
    }

    const pokemonsDestaque = [];
    for (const id of destaques) {
        let p = pokemonData.find(poke => poke.id === id);
        if (!p) {
            try {
                p = await buscarPokemonAvulso(id);
                if (p) pokemonData.push(p);
            } catch (e) {
                console.error(`Erro ao buscar destaque #${id}:`, e);
            }
        }
        if (p) pokemonsDestaque.push(p);
    }

    container.innerHTML = '';

    if (!pokemonsDestaque.length) return;

    pokemonsDestaque.forEach(p => {
        renderizarCard(p, container, false);
    });

    numReaisCarrossel = pokemonsDestaque.length;
    numClonesCarrossel = Math.min(4, numReaisCarrossel);

    const cards = [...container.children];

    for (let i = 0; i < numClonesCarrossel; i++) {
        container.appendChild(cards[i].cloneNode(true));
    }
    for (let i = 0; i < numClonesCarrossel; i++) {
        container.insertBefore(cards[cards.length - 1 - i].cloneNode(true), container.firstChild);
    }

    container.style.scrollBehavior = 'auto';
    container.scrollLeft = getCardStep(container) * numClonesCarrossel;
}

async function carregarDestaquesIndex() {
    const container = document.getElementById('pokemon-list');
    if (!container) return;

    await montarDestaques(container);

    if (listenersCarrosselAtivos) return;
    listenersCarrosselAtivos = true;

    container.addEventListener('scroll', () => {
        const step = getCardStep(container);
        if (step === 0) return;

        const scrollPos = container.scrollLeft;

        const inicioReais = step * numClonesCarrossel;
        const fimReais = step * (numClonesCarrossel + numReaisCarrossel);

        if (scrollPos >= fimReais) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = scrollPos - step * numReaisCarrossel;
        } else if (scrollPos < inicioReais) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = scrollPos + step * numReaisCarrossel;
        }
    });

    window.addEventListener('resize', () => {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = getCardStep(container) * numClonesCarrossel;
    });

    window.addEventListener('temaAlterado', () => {
        montarDestaques(container);
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