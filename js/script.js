/* VARIÁVEIS GLOBAIS E CONFIGURAÇÕES */

let pokemonData = [];
let filteredPokemon = [];
let itemsToShow = 8;
const increment = 4;
let currentSort = 'id';
let cardcompare = [];
let ultimasComparacoes = JSON.parse(localStorage.getItem('ultimasComparacoes')) || [];


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

/* -------------------------------------------------
   POP-UP GLOBAL PERSONALIZADO
   Use:
   mostrarPopup("Mensagem", "success");
   mostrarPopup("Mensagem", "error");
   mostrarPopup("Mensagem", "warning");
   mostrarPopup("Mensagem", "info");
   Também retorna Promise para ações após confirmação:
   await mostrarPopup("Sessão encerrada.", "success");
------------------------------------------------- */

function obterDadosPopupSistema(tipo = 'info') {
    const tipos = {
        success: {
            titulo: 'Sucesso',
            icone: '✓',
            classe: 'success'
        },
        error: {
            titulo: 'Erro',
            icone: '!',
            classe: 'error'
        },
        warning: {
            titulo: 'Atenção',
            icone: '!',
            classe: 'warning'
        },
        info: {
            titulo: 'Informação',
            icone: 'i',
            classe: 'info'
        }
    };

    return tipos[tipo] || tipos.info;
}

function mostrarPopup(mensagem, tipo = 'info', opcoes = {}) {
    return new Promise((resolver) => {
        const dados = obterDadosPopupSistema(tipo);
        const overlayAnterior = document.querySelector('.app-popup-overlay');

        if (overlayAnterior) {
            overlayAnterior.remove();
        }

        const titulo = opcoes.titulo || dados.titulo;
        const textoBotao = opcoes.textoBotao || 'Entendi';
        const textoCancelar = opcoes.textoCancelar || 'Cancelar';
        const mostrarCancelar = Boolean(opcoes.mostrarCancelar);

        const overlay = document.createElement('div');
        overlay.className = 'app-popup-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        overlay.innerHTML = `
            <div class="app-popup-card app-popup-${dados.classe}">
                <div class="app-popup-icon" aria-hidden="true">
                    ${dados.icone}
                </div>

                <h2 class="app-popup-title">${titulo}</h2>

                <p class="app-popup-message">${mensagem}</p>

                <div class="app-popup-actions">
                    ${mostrarCancelar ? `
                        <button type="button" class="app-popup-btn app-popup-btn-secondary" data-popup-action="cancelar">
                            ${textoCancelar}
                        </button>
                    ` : ''}

                    <button type="button" class="app-popup-btn app-popup-btn-primary" data-popup-action="confirmar">
                        ${textoBotao}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const card = overlay.querySelector('.app-popup-card');
        const botaoConfirmar = overlay.querySelector('[data-popup-action="confirmar"]');
        const botaoCancelar = overlay.querySelector('[data-popup-action="cancelar"]');

        function fecharPopup(resultado) {
            overlay.classList.remove('ativo');
            card.classList.add('saindo');

            setTimeout(() => {
                overlay.remove();
                document.removeEventListener('keydown', fecharComEsc);
                resolver(resultado);
            }, 220);
        }

        function fecharComEsc(event) {
            if (event.key === 'Escape') {
                fecharPopup(false);
            }
        }

        botaoConfirmar.addEventListener('click', () => fecharPopup(true));

        if (botaoCancelar) {
            botaoCancelar.addEventListener('click', () => fecharPopup(false));
        }

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                fecharPopup(false);
            }
        });

        document.addEventListener('keydown', fecharComEsc);

        requestAnimationFrame(() => {
            overlay.classList.add('ativo');
            botaoConfirmar.focus();
        });
    });
}

/* Fallback: qualquer alert antigo que ainda surgir no projeto vira popup visual */
window.alert = function(mensagem) {
    mostrarPopup(String(mensagem), 'info');
};



/* INICIALIZAÇÃO E UTILITÁRIOS */

/* FUNÇÕES DE SALVAMENTO DE FAVORITOS E SIMULAÇÃO DE FLAG DE LOGIN TEMPORÁRIAS - NÃO MEXER */

/* PARA RESETAR O LOCAL STORAGE, COLE ESTAS DUAS FUNÇÕES NO CONSOLE DO NAVEGADOR E EXECUTE:
localStorage.clear();
location.reload() */

if (localStorage.getItem('usuarioLogado') === null) {
    localStorage.setItem('usuarioLogado', 'false');
}

function estaLogado() {
    return localStorage.getItem('usuarioLogado') === 'true';
}

function loginSimulado(status) {
    localStorage.setItem('usuarioLogado', status);
    console.log(`Estado de login alterado para: ${status}`);
    atualizarInterfaceLogin(); // Garante que a classe do body mude imediatamente
}

//---USERBAR - INICIO---//

const userBarSaudacao = document.getElementById('userBarSaudacao');
const userBarIcon = document.getElementById('userBarIcon');
const userBarLogin = document.getElementById('userBarLogin');
const userBarLogout = document.getElementById('userBarLogout');

if(estaLogado()){
    userBarSaudacao.innerText = "Bem-vindo Admin";
    userBarIcon.classList.replace('userBarIconDeslogado', 'userBarIconLogado');
    userBarLogin.style.display = "none";
    userBarLogout.style.display = "inline";

} else{
    userBarSaudacao.innerText = "Voce está deslogado";
    userBarIcon.classList.replace('userBarIconLogado', 'userBarIconDeslogado');
    userBarLogin.style.display = "inline";
    userBarLogout.style.display = "none";
}
/*
const userBarLogout = document.getElementById('userBarLogout');

userBarLogout.addEventListener('click', () => {
    loginSimulado('false');
    alert("Sessão encerrada.");
    window.location.href = 'mainpage.html';
});
*/
//---USERBAR - FIM---//

function obterFavoritos() {
    const favs = localStorage.getItem('pokemonsFavoritos');
    return favs ? JSON.parse(favs) : [];
}

function salvarFavorito(id) {
    let favs = obterFavoritos();
    if (favs.includes(id)) {
        favs = favs.filter(favId => favId !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem('pokemonsFavoritos', JSON.stringify(favs));
}

function tentarFavoritar(event, elemento, pokemonId) {
    
    event.stopPropagation();

    if (estaLogado()) {
        elemento.classList.toggle('is-favorite');
        salvarFavorito(pokemonId);                
        console.log(`Pokemon ${pokemonId} adicionado aos favoritos.`);
    } else {
        alert("Aviso: Você precisa estar logado para favoritar um Pokémon!");        
        window.location.href = 'login.html';
    }
}

/* --- LÓGICA DE VISIBILIDADE E LOGIN (ADICIONADO) --- */

function atualizarInterfaceLogin() {
    if (estaLogado()) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }
}

function configurarPaginaLogin() {
    const loginForm = document.querySelector('.login-form');
    const loginCard = document.querySelector('.login-card');
    const loginTitle = document.querySelector('.login-card__title');

    if (!loginForm || !loginCard) return;

    if (estaLogado()) {
        // Altera visual para estado logado
        loginForm.style.display = 'none';
        if (loginTitle) loginTitle.textContent = "Você já está logado.";

        const logoutContainer = document.createElement('div');
        logoutContainer.innerHTML = `
            <p style="margin-bottom: 20px;"></p>
            <p style="margin-bottom: 30px; color: white;">Deseja deslogar?</p>
            <button id="btn-logout" class="btn btn-start">Deslogar</button>
        `;
        loginCard.appendChild(logoutContainer);

        document.getElementById('btn-logout').addEventListener('click', async () => {
            loginSimulado('false');
            await mostrarPopup('Sessão encerrada.', 'success', {
                titulo: 'Sessão encerrada',
                textoBotao: 'OK'
            });
            window.location.href = 'mainpage.html';
        });
    } else {
        // Validação admin/1234
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const usuarioInput = document.getElementById('usuario').value;
            const senhaInput = document.getElementById('senha').value;

            if (usuarioInput === 'admin' && senhaInput === '1234') {
                loginSimulado('true');
                await mostrarPopup('Login realizado com sucesso!', 'success', {
                    titulo: 'Bem-vindo!',
                    textoBotao: 'Continuar'
                });
                window.location.href = 'index.html';
            } else {
                await mostrarPopup('Usuário ou senha incorretos.', 'error', {
                    titulo: 'Dados inválidos',
                    textoBotao: 'Tentar novamente'
                });
            }
        });
    }
}

/* ------------------------------------------------- */

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
    
    // Atualiza a classe do body em todas as páginas
    atualizarInterfaceLogin();

    if (path.includes('mainpage.html')) {
        
        await carregarPokedex();
        configurarFiltros();

    } else if (path.includes('compare.html')) {
        
        await carregarPokedex();      


    } else if (path.includes('login.html')) {
        
        configurarPaginaLogin();

    } else if (path.includes('favoritos.html')) {
        
        await carregarFavoritos();

    } else {
        
        await carregarDestaquesIndex();

    }
}

/* LÓGICA DA POKEDEX (MAINPAGE) */

async function carregarPokedex() {
    try {
        const res = await fetch('pokemon-data.json'); 
        pokemonData = await res.json();
        filteredPokemon = [...pokemonData];

        //console.log("dados", filteredPokemon);
        window.dispatchEvent(new Event('pokemonsCarregados'));
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

/* LÓGICA DA INDEX E CARROSSEL */

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

function scrollCarouselCompare(direction) {
    const container = document.getElementById('divUltimasComparacoes');
    const cardWidth = 250;
    const gap = 16;
    const visibleCards = 4;

    const scrollAmount = (cardWidth + gap) * visibleCards;

    container.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
}

/* LÓGICA DE COMPARAÇÃO */

const divUltimasComp = document.getElementById('divUltimasComparacoes');

if(divUltimasComp){
    
    if(ultimasComparacoes.length){
        console.log(ultimasComparacoes);
        ultimasComparacoes.forEach(p => {
            renderizarCard(p, divUltimasComp, false, "");
        });
    } else{
        for(i=0; i<5; i++){
            const card = document.createElement('div');
            card.classList.add('pokemon-card-container');

            card.innerHTML = `
                <div class="pokemon-card-base" style="background-color: rgba(255, 255, 255, 0.1);">            
                    <div class="glass-info-panel">
                        <div class="header-row">
                            <h3 class="pokemon-name" style="text-transform:capitalize;">Vazio</h3>
                            <span class="pokemon-number">#</span>
                        </div>
                        <div class="types-wrapper">
                        </div>
                    </div>
                </div>                
            `;

            divUltimasComp.appendChild(card);
        }
    }
     
    /*
    window.addEventListener('pokemonsCarregados',() => {
        filteredPokemon.forEach(p => {
            renderizarCard(p, divUltimasComp, false, "");
        });
    });
    */
}

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
                <li class="card-add-info" style="background: ${obterBackground(pokemon.type)}">Ataque: ${pokemon.attack}</li>
                <li class="card-add-info" style="background: ${obterBackground(pokemon.type)}">Defesa: ${pokemon.defense}</li>
                <li class="card-add-info" style="background: ${obterBackground(pokemon.type)}">HP: ${pokemon.hp}</li>
                <li class="card-add-info" style="background: ${obterBackground(pokemon.type)}">Mov.: ${pokemon.moves}</li>
            </ul>
        </div>
    `;
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
        abrirmodal('card1');
    });

    card02.addEventListener('click', () => {
        abrirmodal('card2');
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
                    <input type="text" id="modalSearchInput" placeholder="Buscar por nome ou número...">
                </div>
              
                <div class="sort-container" id="btn-modal-compare">
                    <span>Buscar</span>
                </div>
                <button id="buttonFecharX" style="background:none; border:none; color:white; cursor:pointer; font-size:1.5rem;">X</button>
            </div>
            <div id="modal-body">
                <div id="modal-body-grid"></div>
            </div>
        </div>
    `;
    
    const bodymodal = document.getElementById('modal-body-grid');
    const modalSearchInput = document.getElementById('modalSearchInput');
    
    const renderizarFiltradosNoModal = (lista) => {
        bodymodal.innerHTML = ""; 
        lista.forEach(p => {            
            renderizarCard(p, bodymodal, true, card);
        });
    };

    // Renderização inicial (todos os pokémons)
    renderizarFiltradosNoModal(filteredPokemon);

    // Lógica do Filtro dentro do Modal
    modalSearchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        
        const resultados = pokemonData.filter(p => 
            p.name.toLowerCase().includes(termo) || 
            p.id.toString().includes(termo)
        );

        renderizarFiltradosNoModal(resultados);
    });

    // Para fechar o modal
    const fecharModal = () => { modal.innerHTML = ""; };
    
    document.getElementById('fade').addEventListener('click', fecharModal);
    document.getElementById('buttonFecharX').addEventListener('click', fecharModal);
}

function battle() {

    if(cardcompare[0] && cardcompare[1]){
        let pontuacaoPokemon = [];
        let ganhador = [];

        //adiciono aqui os ultimos comparados na Array de historico
        ultimasComparacoes.unshift(cardcompare[0], cardcompare[1]);
        localStorage.setItem('ultimasComparacoes', JSON.stringify(ultimasComparacoes));

        cardcompare[0].attack > cardcompare[1].attack ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;
        cardcompare[0].defense > cardcompare[1].defense ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;
        cardcompare[0].hp > cardcompare[1].hp ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;

        console.log("pontuacaoPokemon01", pontuacaoPokemon[0]);
        console.log("pontuacaoPokemon02", pontuacaoPokemon[1]);

         if(pontuacaoPokemon[0] > pontuacaoPokemon[1]){
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

        cardcompare[0] = [];
        cardcompare[1] = [];
    }
    else {
        mostrarPopup('Você precisa adicionar os dois Pokémons nos cards!', 'warning', {
            titulo: 'Atenção',
            textoBotao: 'OK'
        })
    } 
    
}

function renderizarVencedor(ganhador){
    const winner = document.getElementById('modal-container');

    winner.innerHTML = `
        
        <div id="modal">
            <a href="compare.html" id="buttonFecharXModalWinner">X</a>
            <div id="winner-column">
                <div>
                    <img class="imagem-winner" src="../assets/img/winner.png" alt="Winner!">
                    <h1 id="winner-pokemon-name">${ganhador.name}</h1>
                </div>
                <img class="imagem-pokemon-winner" src="${ganhador.image}" alt="pikachu">
            </div>
            
        </div>
    `;
}

/* FUNÇÃO MESTRE DE RENDERIZAÇÃO DE CARD */

function renderizarCard(p, container, isMainPage, origem) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card-container');

    if (!isMainPage) {
        card.style.flex = "0 0 250px";
    }

    const listaFavs = buscarLS('pokemonFavoritos', []);
    const jaEFavorito = listaFavs.includes(p.id) ? 'is-favorite' : '';

    const favButton = isMainPage ? `
        <div class="favorite-toggle ${jaEFavorito}" onclick="tentarFavoritar(event, this, ${p.id})">
            <div class="pokeball-icons-wrapper">
                <svg class="icon-outline" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                    <path d="M2 12h20" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/>
                </svg>

                <svg class="icon-filled" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12h20C22 6.48 17.52 2 12 2z" fill="#EE1515"/>
                    <path d="M12 22c5.52 0 10-4.48 10-10H2c0 5.52 4.48 10 10 10z" fill="white"/>
                    <rect x="2" y="11" width="20" height="2" fill="#222222"/>
                    <circle cx="12" cy="12" r="4" fill="white" stroke="#222222" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="1.5" fill="#222222"/>
                </svg>
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
                    <h3 class="pokemon-name" style="text-transform:capitalize;">${p.name}</h3>
                    <span class="pokemon-number">#${p.id.toString().padStart(3, '0')}</span>
                </div>
                <div class="types-wrapper">
                    ${p.type.map(t => `<span class="type-badge ${t}">${t}</span>`).join('')}
                </div>
            </div>
        </div>
        ${detailsPanel} 
    `;

    // Click do card: só ativa lógica de comparação na página compare
    if (document.querySelector('.modal-container')) {
        const btnAdd = card.querySelector(".glass-info-panel");

        if(btnAdd && origem){
            btnAdd.addEventListener('click', () => {
                if(origem === 'card1'){
                    if(!cardcompare[1] || p.id != cardcompare[1].id){
                        cardcompare[0] = p;
                        renderizarNoSlot(origem, p);
                        document.querySelector('.modal-container').innerHTML = "";
                    } else {
                        mostrarPopup('Você não pode escolher o mesmo Pokémon!', 'warning', {
                            titulo: 'Escolha inválida',
                            textoBotao: 'OK'
                        });
                    }
                } else{
                    if(!cardcompare[0] || p.id != cardcompare[0].id){
                        cardcompare[1] = p;
                        renderizarNoSlot(origem, p);
                        document.querySelector('.modal-container').innerHTML = "";
                    } else {
                        mostrarPopup('Você não pode escolher o mesmo Pokémon!', 'warning', {
                            titulo: 'Escolha inválida',
                            textoBotao: 'OK'
                        });
                    }
                }
            }); 
        }
    }
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

/* ============================================
   LÓGICA DE FAVORITOS
   ============================================ */

/* LocalStorage helpers */
function salvarLS(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

function buscarLS(chave, padrao = null) {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : padrao;
}

/* Verifica se pokemon já é favorito */
function verificarFavorito(id) {
    return buscarLS('pokemonFavoritos', []).includes(id);
}

async function tentarFavoritar(event, elemento, pokemonId) {
    event.stopPropagation(); // Evita que o clique vaze para o card de trás

    if (estaLogado()) {
        toggleFavorito(pokemonId, elemento);
    } else {
        await mostrarPopup('Você precisa estar logado para favoritar um Pokémon!', 'warning', {
            titulo: 'Login necessário',
            textoBotao: 'Ir para login'
        });
        window.location.href = 'login.html';
    }
}

/* Salva/remove favorito ao clicar na pokébola */
function toggleFavorito(id, elemento) {
    let favoritos = buscarLS('pokemonFavoritos', []);

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(fav => fav !== id);
        elemento.classList.remove('is-favorite');
    } else {
        favoritos.push(id);
        elemento.classList.add('is-favorite');
    }

    salvarLS('pokemonFavoritos', favoritos);

    // Se estiver na página de favoritos, re-renderiza
    if (window.location.pathname.includes('favoritos.html')) {
        carregarFavoritos();
    }
}

/* Carrega e renderiza a página de favoritos */
async function carregarFavoritos() {
    const grid = document.getElementById('favoritosGrid') || document.querySelector('.favoritos-grid') || document.getElementById('pokemonGrid');
    if (!grid) return;

    if (!estaLogado()) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: white;">
                <h2 style="margin-bottom: 20px; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Faça login para acessar sua lista de favoritos</h2>
                <br>
                <button onclick="window.location.href='login.html'" class="btn-start">Ir para Login</button>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch('pokemon-data.json');
        const todosPokemons = await res.json();

        const favIds = buscarLS('pokemonFavoritos', []);
        const pokemonsFavoritos = todosPokemons.filter(p => favIds.includes(p.id));

        grid.innerHTML = '';

        pokemonsFavoritos.forEach(pokemon => {
            renderizarCard(pokemon, grid, true, null);
        });

        // Slots vazios para completar até mínimo de 6 células, gerados exatamente como você determinou
        const minSlots = 6;
        const slotsVazios = Math.max(1, minSlots - pokemonsFavoritos.length);
        for (let i = 0; i < slotsVazios; i++) {
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.classList.add('slot-vazio');
            slot.textContent = '+';
            slot.addEventListener('click', adicionarFavoritoManual);
            grid.appendChild(slot);
        }

    } catch (erro) {
        console.error('Erro ao carregar favoritos:', erro);
    }
}

/* ---- MODAL DE ADICIONAR FAVORITOS ---- */

let todosPokemonsModalFavoritos = [];

function criarModalFavoritos() {
    if (document.getElementById('modalFavoritos')) return;

    const modal = document.createElement('div');
    modal.id = 'modalFavoritos';
    modal.classList.add('favoritos-modal-overlay');

    modal.innerHTML = `
        <div class="favoritos-modal">
            <div class="favoritos-modal-header">
                <div>
                    <h2>Adicionar Pokémon</h2>
                    <p>Escolha um Pokémon para colocar nos seus favoritos.</p>
                </div>
                <button class="fechar-modal-favoritos" onclick="fecharModalFavoritos()">×</button>
            </div>

            <input
                type="text"
                id="buscaPokemonFavorito"
                class="busca-modal-favoritos"
                placeholder="Buscar por nome ou número..."
                oninput="filtrarPokemonsModalFavoritos()"
            >

            <div id="listaPokemonsModal" class="lista-pokemons-modal">
                <div id="listaPokemonsModalGrid" class="lista-pokemons-modal-grid"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar clicando fora
    modal.addEventListener('click', function (event) {
        if (event.target === modal) fecharModalFavoritos();
    });
}

async function adicionarFavoritoManual() {
    criarModalFavoritos();

    const modal = document.getElementById('modalFavoritos');
    modal.classList.add('ativo');

    if (todosPokemonsModalFavoritos.length === 0) {
        try {
            const res = await fetch('pokemon-data.json');
            todosPokemonsModalFavoritos = await res.json();
        } catch (erro) {
            console.error('Erro ao carregar pokémons no modal:', erro);
            await mostrarPopup('Não foi possível carregar a lista de Pokémons.', 'error', {
                titulo: 'Erro ao carregar',
                textoBotao: 'OK'
            });
            return;
        }
    }

    const inputBusca = document.getElementById('buscaPokemonFavorito');
    if (inputBusca) {
        inputBusca.value = '';
        inputBusca.focus();
    }

    renderizarPokemonsModalFavoritos(todosPokemonsModalFavoritos);
}

function fecharModalFavoritos() {
    const modal = document.getElementById('modalFavoritos');
    if (modal) modal.classList.remove('ativo');
}

function filtrarPokemonsModalFavoritos() {
    const inputBusca = document.getElementById('buscaPokemonFavorito');
    if (!inputBusca) return;

    const termo = inputBusca.value.toLowerCase().trim();
    const filtrados = todosPokemonsModalFavoritos.filter(p =>
        p.name.toLowerCase().includes(termo) || p.id.toString().includes(termo)
    );

    renderizarPokemonsModalFavoritos(filtrados);
}

function renderizarPokemonsModalFavoritos(listaPokemons) {
    const grid = document.getElementById('listaPokemonsModalGrid');
    if (!grid) return;

    const favIds = buscarLS('pokemonFavoritos', []);
    grid.innerHTML = '';

    if (listaPokemons.length === 0) {
        grid.innerHTML = `<div class="modal-sem-resultado">Nenhum Pokémon encontrado.</div>`;
        return;
    }

    listaPokemons.slice(0, 80).forEach(pokemon => {
        const jaAdicionado = favIds.includes(pokemon.id);

        renderizarCard(pokemon, grid, true, null);

        const card = grid.lastElementChild;

        if (jaAdicionado) {
            card.style.opacity = '0.45';
            card.style.pointerEvents = 'none';
        } else {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => salvarPokemonNosFavoritos(pokemon.id));
        }
    });
}

function salvarPokemonNosFavoritos(id) {
    let favoritos = buscarLS('pokemonFavoritos', []);
    if (!favoritos.includes(id)) favoritos.push(id);
    salvarLS('pokemonFavoritos', favoritos);
    fecharModalFavoritos();
    carregarFavoritos();
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') fecharModalFavoritos();
});

// Inicialização imediata
inicializar();
