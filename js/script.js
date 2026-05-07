/* VARIÁVEIS GLOBAIS E CONFIGURAÇÕES */

let pokemonData = [];
let filteredPokemon = [];
let itemsToShow = 8;
const increment = 4;
let currentSort = 'id';
let cardcompare = [];


const cores = {
    fire: 'var(--clr-fire)',
    grass: 'var(--clr-grass)',
    water: 'var(--clr-water)',
    bug: 'var(--clr-bug)',
    normal: 'var(--clr-normal)',
    electric: 'var(--clr-electric)',
    poison: 'var(--clr-poison)',
    ground: 'var(--clr-ground)',
    flying: 'var(--clr-flying)',
    fairy: '#d685ad'
};

/* INICIALIZAÇÃO E UTILITÁRIOS */

function obterBackground(tipos) {
    const listaTipos = Array.isArray(tipos) ? tipos : [tipos.toLowerCase()];

    if (listaTipos.length > 1) {
        const c1 = cores[listaTipos[0]] || '#777';
        const c2 = cores[listaTipos[1]] || '#777';

        return `linear-gradient(45deg, ${c1} 0%, ${c2} 100%)`;
    }

    return cores[listaTipos[0]] || '#777';
}

async function inicializar() {
    const path = window.location.pathname;
    
    if (path.includes('mainpage.html')) {
        
        await carregarPokedex();
        configurarFiltros();

    } else if (path.includes('compare.html')) {
        
        await carregarPokedex();

    } else {
        
        await carregarDestaquesIndex();

    }
}

/* LÓGICA DA POKEDEX (MAINPAGE) */

async function carregarPokedex() {
    try {
        const res = await fetch('../html/pokemon-data.json'); 
        pokemonData = await res.json();
        filteredPokemon = [...pokemonData];

        console.log("dados", filteredPokemon);
        
        renderizarGrid();
    } catch (e) {
        console.error("Erro no JSON:", e);
    }
}

function configurarFiltros() {
    const searchInput = document.getElementById('searchInput');
    const sortBtn = document.getElementById('sortBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();

            filteredPokemon = pokemonData.filter(p => 
                p.name.toLowerCase().includes(termo) || 
                p.id.toString().includes(termo)
            );

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

function renderizarGrid() {
    const grid = document.getElementById('pokemonGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!grid) return;

    grid.innerHTML = "";
    const visiveis = filteredPokemon.slice(0, itemsToShow);

    visiveis.forEach(p => {
        renderizarCard(p, grid, true);
    });

    if (loadMoreBtn) {
        loadMoreBtn.style.display = (itemsToShow >= filteredPokemon.length) ? 'none' : 'block';
    }
}

function carregarMais() {
    itemsToShow += increment;
    renderizarGrid();
}

/* OBSERVER PARA CARREGAR MAIS CARDS QUANDO APARECER O BOTAO CARREGAR NA TELA DA POKEDEX */

document.addEventListener("DOMContentLoaded", () => {
    const carregarMaisObserver = document.querySelector("#loadMoreBtn");
    if(!carregarMaisObserver) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                setTimeout(() => {
                    carregarMais();
                }, 100);
            }
        });
    }, {
        threshold: 1 // Carrega quando 100% do elemento estiver visível
    });

    observer.observe(carregarMaisObserver);
});

/* LÓGICA DA INDEX E CARROSSEL (ORIGINAL) */

async function carregarDestaquesIndex() {
    const container = document.getElementById('pokemon-list');
    if (!container) return;

    const destaques = [25, 2, 5, 8, 1, 4, 7, 10, 12];

    for (let id of destaques) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const p = await res.json();

            renderizarCard({
                name: p.name, 
                id: p.id, 
                hp: p.stats[0].base_stat,
                attack: p.stats[1].base_stat, 
                defense: p.stats[2].base_stat,
                type: p.types.map(t => t.type.name),
                moves: p.moves.slice(0, 2).map(m => m.move.name),
                image: p.sprites.other['official-artwork'].front_default
            }, container, false);

        } catch (e) {
            console.error(e);
        }
    }
}

// Carrossel 
function scrollCarousel(direction) {
    const container = document.getElementById('pokemon-list');
    const cardWidth = 250;
    const gap = 15;
    const visibleCards = 4;

    const scrollAmount = (cardWidth + gap) * visibleCards;

    container.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
}

/* LÓGICA DE COMPARAÇÃO */

function renderizarNoSlot(containerId, pokemon) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const backgroundStyle = obterBackground(pokemon.type);

    container.innerHTML = `
        <div class="card-add">
            <div class="card-add-head" style="background: ${backgroundStyle};">
                <img class="card-img" src="${pokemon.image}" alt="${pokemon.name}">
                
                <div class="card-add-head-title">
                    <div class="header-row" style="display: flex; justify-content: space-between; width: 100%; align-items: center; padding: 0 10px;">
                        <h3 class="pokemon-name" style="color: white; margin: 0;">${pokemon.name}</h3>
                        <span class="pokemon-number" style="color: rgba(255,255,255,0.8); text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                            #${pokemon.id.toString().padStart(3, '0')}
                        </span>
                    </div>
                    
                    <div class="types-wrapper" style="display: flex; gap: 5px; margin-top: 5px; padding: 0 10px;">
                        ${pokemon.type.map(t => `<span class="type-badge ${t}">${t}</span>`).join('')}
                    </div>
                </div>            
            </div>

            <ul class="card-add-info-content" style="list-style: none; padding: 0;">
                <li class="card-add-info">Ataque: ${pokemon.attack}</li>
                <li class="card-add-info">Defesa: ${pokemon.defense}</li>
                <li class="card-add-info">Estamina: ${pokemon.stamina}</li>
                <li class="card-add-info">PC Máx: ${pokemon.maxPc}</li>
            </ul>
        </div>
    `;
}

function addCard1() {
    card1 = true;
    renderizarNoSlot('card1', 
        { id: 25, 
        name: "Pikachu", 
        type: ["electric"], 
        attack: 112, 
        defense: 96, 
        stamina: 111, 
        maxPc: 1060, 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
    }); 
}

function addCard2() {
    card2 = true;
    renderizarNoSlot('card2', 
        { id: 1, name: "Bulbasaur", 
        type: ["grass", "poison"], 
        attack: 118, 
        defense: 111, 
        stamina: 128, 
        maxPc: 1115, 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" 
    }); 
}

function irParaSectionCompare() {
    const section = document.getElementById('sectionCompare');
    
    section.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", () => {
    const target = document.querySelector("#sectionCompare");
    if(!target) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                target.style.visibility = 'visible';
                target.style.animation = 'slideUp 0.5s ease forwards';
                
                // Parar de observar após renderizar
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8 // Carrega quando 80% do elemento estiver visível
    });

    observer.observe(target);
});


/* EVENTO DE CLICK NOS CARDS ADD */
const card01 = document.getElementById('card1');
const card02 = document.getElementById('card2');

if (card01 && card02) {        
    card01.addEventListener('click', () => {
        abrirmodal(1);
    });

    card02.addEventListener('click', () => {
        abrirmodal(2);
    });
}

function abrirmodal(card){
    const modal = document.querySelector('.modal-container');
  
    modal.innerHTML = `
        <div id="fade"></div>
        <div id="modal">
            <div class="search-sort-bar" id="modal-header">
   
                <div class="search-container">
                    <span>🔍</span>
                    <input type="text" id="searchInput" placeholder="Buscar por nome ou número...">
                </div>
                <div class="sort-container" id="btn-modal-compare">
                    <span>Buscar</span>
                </div>
                
            </div>
            <div id="modal-body">
                <div id="modal-body-grid"></div>
            </div>
        </div>
    `;
    
    const bodymodal = document.getElementById('modal-body-grid');

    filteredPokemon.forEach(p => {
        renderizarCard(p, bodymodal, true);
    });

    const btnBusca = document.getElementById('btn-modal-compare');
    const fadearea = document.getElementById('fade');

    btnBusca.addEventListener('click', () => {
       card == 1 ? addCard1() : addCard2();
    });

    //Para fechar o modal
    fadearea.addEventListener('click', () => {
         modal.innerHTML = "";
    });
    //--------//--------//
}


function battle() {

    if(cardcompare[0] && cardcompare[1]){
        let pontuacaoPokemon01 = 0;
        let pontuacaoPokemon02 = 0;
        let ganhador = [];

        cardcompare[0].attack > cardcompare[1].attack ? pontuacaoPokemon01++ : pontuacaoPokemon02++;
        cardcompare[0].defense > cardcompare[1].defense ? pontuacaoPokemon01++ : pontuacaoPokemon02++;
        cardcompare[0].hp > cardcompare[1].hp ? pontuacaoPokemon01++ : pontuacaoPokemon02++;

        console.log("pontuacaoPokemon01", pontuacaoPokemon01);
        console.log("pontuacaoPokemon02", pontuacaoPokemon02);

         if(pontuacaoPokemon01 > pontuacaoPokemon02){
            ganhador = cardcompare[0];
         } else {
            ganhador = cardcompare[1];
         }

        const section = document.getElementById('sectionCompare');
        const bannersection = document.querySelector('.hero-div');

        //section.style.display = 'flex';
        bannersection.style.display = 'none';
        section.style.backgroundColor = 'black';

        section.innerHTML = `
            <div id="battleDiv">
                <img src="../assets/img/animacao1.gif" alt="animacao" id="animacaoBattle">
            </div>
        `;

        //section.scrollIntoView({ behavior: 'smooth' });
        

        setTimeout(function() {
            document.getElementById('animacaoBattle').style.display = 'none';
            section.style.backgroundColor = 'transparent';
            renderizarVencedor(ganhador);
        }, 500);
    }
    else {
        alert("Você precisa adicionar os dois pokemons nos cards!")
    } 
    
}

function renderizarVencedor(ganhador){
    const winner = document.getElementById('battleDiv');

    winner.innerHTML = `
        <div id="winner-column">
            <img class="imagem-pokemon-winner" src="${ganhador.image}" alt="pikachu">
        </div>

        <div id="winner-column">
            <img class="imagem-pokemon-winner" src="../assets/img/winner.png" alt="Winner!">

            <h1 id="winner-pokemon-name">${ganhador.name}</h1>

            <div class="winner-info-content">
                <div class="winner-info"></div>
                <div class="winner-info"></div>
                <div class="winner-info"></div>
                <div class="winner-info"></div>
            </div>
        </div>
    `;
}

/* FUNÇÃO MESTRE DE RENDERIZAÇÃO DE CARD */

function renderizarCard(p, container, isMainPage) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card-container');

    if (!isMainPage) {
        card.style.flex = "0 0 250px";
    }

    const favButton = isMainPage ? `
        <div class="favorite-toggle" onclick="this.classList.toggle('is-favorite')">
            <div class="pokeball-icons-wrapper">
                <svg class="icon-outline" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M2 12h20" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/></svg>
                <svg class="icon-filled" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12h20C22 6.48 17.52 2 12 2z" fill="#EE1515"/><path d="M12 22c5.52 0 10-4.48 10-10H2c0 5.52 4.48 10 10 10z" fill="white"/><rect x="2" y="11" width="20" height="2" fill="#222222"/><circle cx="12" cy="12" r="4" fill="white" stroke="#222222" stroke-width="1.5"/><circle cx="12" cy="12" r="1.5" fill="#222222"/></svg>
            </div>
        </div>` : '';

    const detailsPanel = isMainPage ? `
        <button class="expand-btn" onclick="toggleDetails(this)">▼</button>
        <div class="details-panel">
            <div style="min-height: 0;">
                <div class="stat-row"><span>Ataque</span><span>${p.attack}</span></div>
                <div class="stat-row"><span>Defesa</span><span>${p.defense}</span></div>
                <div class="moves-section">
                    <p style="font-size:0.75rem; font-weight:bold; margin-bottom:4px; opacity:0.9; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">Ataques:</p>
                    <div style="display:flex; flex-wrap:wrap;">
                        ${p.moves.map(m => `<button class="pixel-move-btn">${m}</button>`).join('')}
                    </div>
                </div>
            </div>
        </div>` : '';

    card.innerHTML = `
        <div class="pokemon-card-base" style="background: ${obterBackground(p.type)};">
            ${isMainPage ? `<span class="hp-badge">HP ${p.hp}</span>` : ''}
            ${favButton}
            <img src="${p.image}" class="pokemon-image-card" alt="${p.name}">
            <div class="glass-info-panel">
                <div class="header-row">
                    <h3 class="pokemon-name">${p.name}</h3>
                    <span class="pokemon-number" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">#${p.id.toString().padStart(3, '0')}</span>
                </div>
                <div class="types-wrapper">
                    ${p.type.map(t => `<span class="type-badge ${t}">${t}</span>`).join('')}
                </div>
            </div>
        </div>
        ${detailsPanel}
    `;

    card.addEventListener('click', () => {
            if(!cardcompare[0]){
                cardcompare[0] = p;
                renderizarNoSlot('card1', cardcompare[0]);
            } else{ 
                cardcompare[1] = p;
                renderizarNoSlot('card2', cardcompare[1]);
            }

            console.log("Pokemon array 01:", cardcompare[0]);
            console.log("Pokemon array 02:", cardcompare[1]);
            
        }); 
    container.appendChild(card);
}

function toggleDetails(btn) {
    const panel = btn.nextElementSibling;
    panel.classList.toggle('open');
    btn.textContent = panel.classList.contains('open') ? '▲' : '▼';
}


/* 7. UTILITÁRIOS FINAIS (SCROLL E WINDOW)*/

window.onscroll = () => {
    const btn = document.getElementById("backToTop");
    if (btn) {
        btn.classList.toggle("show", window.scrollY > 300);
    }
};

function scrollToTop() { 
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    }); 
}

// Inicialização imediata
inicializar();