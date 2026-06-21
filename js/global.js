let pokemonData = [];
let filteredPokemon = [];
let itemsToShow = 8;
const increment = 4;
let currentSort = 'id';
let cardcompare = [];
let ultimasComparacoes = JSON.parse(localStorage.getItem('ultimasComparacoes')) || [];
let configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || {sons: true, musica: true, temaEscuro: false};

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
    fairy: 'var(--clr-fairy)',
    fighting: 'var(--clr-fighting)',
    psychic: 'var(--clr-psychic)',
    rock: 'var(--clr-rock)',
    ghost: 'var(--clr-ghost)',
    ice: 'var(--clr-ice)',
    dragon: 'var(--clr-dragon)',
    dark: 'var(--clr-dark)',
    steel: 'var(--clr-steel)'
};

if(configuracoes.temaEscuro === true){
    const htmlElement = document.documentElement;
    htmlElement.classList.add('tema-escuro');
} else {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('tema-claro');
}

//Liga a musica tema
if (configuracoes.musica) {
    musica.muted = false;
} else {
    musica.muted = true;
}

//Sons
document.addEventListener('click', async () => {
    const beep = new Audio('../assets/audio/beep.mp3');

    await beep.play();
});

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

window.alert = function(mensagem) {
    mostrarPopup(String(mensagem), 'info');
};

if (localStorage.getItem('usuarioLogado') === null) {
    localStorage.setItem('usuarioLogado', 'false');
}

function estaLogado() {
    return localStorage.getItem('usuarioLogado') === 'true';
}

function loginSimulado(status) {
    localStorage.setItem('usuarioLogado', status);
    console.log(`Estado de login alterado para: ${status}`);
    atualizarInterfaceLogin(); 
}

const userBarSaudacao = document.getElementById('userBarSaudacao');
const userBarIcon = document.getElementById('userBarIcon');
const userBarLogin = document.getElementById('userBarLogin');
const userBarLogout = document.getElementById('userBarLogout');

if(estaLogado()){
    userBarSaudacao.innerText = "Bem-vindo, Admin";
    userBarIcon.classList.replace('userBarIconDeslogado', 'userBarIconLogado');
    userBarLogin.style.display = "none";
    userBarLogout.style.display = "inline";

} else{
    userBarSaudacao.innerText = "Voce está deslogado";
    userBarIcon.classList.replace('userBarIconLogado', 'userBarIconDeslogado');
    userBarLogin.style.display = "inline";
    userBarLogout.style.display = "none";
}

userBarLogout.addEventListener('click', () => {
    loginSimulado('false');
    alert("Sessão encerrada.");
    window.location.href = 'mainpage.html';
});



function atualizarInterfaceLogin() {
    if (estaLogado()) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }
}

function toggleConfig(){
    const panelConfig = document.getElementById('configPainel');
    panelConfig.classList.toggle('open');

    if (!panelConfig.classList.contains('open')) {return;}

        panelConfig.innerHTML = `
            <div>
                <span>Sons</span>
                <div class="chave ${configuracoes.sons ? 'true' : 'false'}" id="chaveSons">
                    <span class="chaveSeletor"></span>
                </div>
            </div>
            <div>
                <span>Música</span>
                <div class="chave ${configuracoes.musica ? 'true' : 'false'}" id="chaveMusica">
                    <span class="chaveSeletor"></span>
                </div>
            </div>
            <div>
                <span>Tema escuro</span>
                <div class="chave ${configuracoes.temaEscuro ? 'true' : 'false'}" id="chaveTemaEscuro">
                    <span class="chaveSeletor"></span>
                </div>
            </div>
            <div>
                <span id="chaveLimparCache" style="cursor: pointer;">Limpar cache</span>
            </div>
        `;

        const chaveSons = document.getElementById('chaveSons');
        const chaveMusica = document.getElementById('chaveMusica');
        const chaveTemaEscuro = document.getElementById('chaveTemaEscuro');
        const chaveLimparCache = document.getElementById('chaveLimparCache');
        const htmlElement = document.documentElement;

        chaveSons.addEventListener('click', () => {
            configuracoes.sons = !configuracoes.sons;
            chaveSons.classList.toggle('true', configuracoes.sons);
            chaveSons.classList.toggle('false', !configuracoes.sons);
            
            localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
            console.log(configuracoes);
        });

        chaveMusica.addEventListener('click', () => {
            configuracoes.musica = !configuracoes.musica;
            chaveMusica.classList.toggle('true', configuracoes.musica);
            chaveMusica.classList.toggle('false', !configuracoes.musica);

        //Liga a musica tema
        if (configuracoes.musica) {
            musica.muted = false;
        } else {
            musica.muted = true;
        }
            
            localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
            console.log(configuracoes);
        });

        chaveTemaEscuro.addEventListener('click', () => {
            configuracoes.temaEscuro = !configuracoes.temaEscuro;
            chaveTemaEscuro.classList.toggle('true', configuracoes.temaEscuro);
            chaveTemaEscuro.classList.toggle('false', !configuracoes.temaEscuro);

            htmlElement.classList.toggle('tema-escuro', configuracoes.temaEscuro);
            htmlElement.classList.toggle('tema-claro', !configuracoes.temaEscuro);

            localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
            console.log(configuracoes);
        });

        chaveLimparCache.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    
}

function obterBackground(tipos) {
    const listaTipos = Array.isArray(tipos) ? tipos : [tipos.toLowerCase()];

    if (listaTipos.length > 1) {
        const c1 = cores[listaTipos[0]] || '#777';
        const c2 = cores[listaTipos[1]] || '#777';

        return `linear-gradient(45deg, ${c1} 0%, ${c2} 100%)`;
    }

    return cores[listaTipos[0]] || '#777';
}

function buscarPokemonsPorTermo(listaBase, termo) {
    const t = termo.toLowerCase().trim();
    
    if (t === '') return listaBase;

    return listaBase.filter(p => 
        p.name.toLowerCase().includes(t) || 
        p.id.toString().includes(t) || 
        p.type.some(tipo => tipo.toLowerCase().includes(t))
    );
}

async function inicializar() {
    const path = window.location.pathname;
    
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

function sanitizarNomePokemon(nome) {
    // Whitelist de nomes que devem manter o hífen:
    const excecoesHifen = [
        'ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o', 
        'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'type-null',
        'chien-pao', 'ting-lu', 'wo-chien', 'chi-yu', 'great-tusk', 
        'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 
        'sandy-shocks', 'iron-treads', 'iron-bundle', 'iron-hands', 
        'iron-jugulis', 'iron-moth', 'iron-thorns', 'roaring-moon', 
        'iron-valiant', 'walking-wake', 'iron-leaves', 'gouging-fire', 
        'raging-bolt', 'iron-boulder', 'iron-crown', 'mr-mime'
    ];

    // Substitui os hífens por espaços para os nomes que estão na whitelist
    if (excecoesHifen.includes(nome)) {
        return nome.split('-').join(' ');
    }

    // Para todos os outros, corta o nome no primeiro hífen
    return nome.split('-')[0];
}

async function fetchPokemonBatch(offset = 0, limit = 100) {
    // Busca a lista inicial com as URLs de cada Pokémon do lote
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    
    // Busca os detalhes de cada Pokémon paralelamente e mapeia para o formato padrão
    const detailedPokemons = await Promise.all(data.results.map(async (poke) => {
        const res = await fetch(poke.url);
        const details = await res.json();
        
        // Mesma estrutura usada no pokemon-data.json
        return {
            id: details.id,
            name: sanitizarNomePokemon(details.name),
            type: details.types.map(t => t.type.name),
            hp: details.stats.find(s => s.stat.name === 'hp').base_stat,
            attack: details.stats.find(s => s.stat.name === 'attack').base_stat,
            defense: details.stats.find(s => s.stat.name === 'defense').base_stat,
            moves: details.moves.slice(0, 2).map(m => m.move.name), // Pega apenas os 2 primeiros ataques
            image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default
        };
    }));
    
    return detailedPokemons.filter(p => p.id <= 1025);
}

async function iniciarCarregamentoBackground(offsetInicial) {
    let offset = offsetInicial;
    const limit = 20;
    const maxPokemons = 1025; // Limite do total de pokemons presentes na pokéapi

    while (offset < maxPokemons) {
        try {
            const lote = await fetchPokemonBatch(offset, limit);
            
            // Incrementa o array global com os novos dados
            pokemonData = [...pokemonData, ...lote];
            
            // Só atualiza o array filtrado se o usuário não estiver pesquisando ativamente
            const searchInput = document.getElementById('searchInput');
            if (!searchInput || searchInput.value.trim() === '') {
                // Mantém a ordem atual (seja por ID ou Nome)
                filteredPokemon = [...pokemonData];
                if (currentSort === 'name') {
                    filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
                }
            }
            
            // Atualiza a Session Storage para manter os dados durante a navegação
            sessionStorage.setItem('pokemonDataCache', JSON.stringify(pokemonData));
            window.dispatchEvent(new Event('pokemonsAtualizados'));
            
            offset += limit;
        } catch (error) {
            console.error(`Erro ao carregar o lote no offset ${offset}:`, error);
            break; // Interrompe o looping em caso de erro de rede para não travar o loop infinito
        }
    }
}

async function carregarPokedex() {
    try {
        // Verifica se os dados já foram carregados nesta sessão (Session Storage)
        const cache = sessionStorage.getItem('pokemonDataCache');
        
        if (cache) {
            // Se o cache existir, converte de volta para Objeto e alimenta as variáveis globais
            pokemonData = JSON.parse(cache);
            filteredPokemon = [...pokemonData];
            
            window.dispatchEvent(new Event('pokemonsCarregados'));
            renderizarGrid();
            
            // Retoma o carregamento do ponto onde parou (caso o usuário atualize a página antes de terminar o carregamento completo)
            iniciarCarregamentoBackground(pokemonData.length);
        } else {
            // Se não houver cache, carrega um lote inicial menor (ex: 50) para a tela não ficar em branco muito tempo
            const primeiroLote = await fetchPokemonBatch(0, 50);
            pokemonData = primeiroLote;
            filteredPokemon = [...pokemonData];
            
            sessionStorage.setItem('pokemonDataCache', JSON.stringify(pokemonData));
            
            window.dispatchEvent(new Event('pokemonsCarregados'));
            renderizarGrid();
            
            // Inicia o carregamento do restante do banco de dados no looping em segundo plano
            iniciarCarregamentoBackground(50);
        }
    } catch (e) {
        console.error("Erro ao iniciar a Pokedex com a API:", e);
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

    if (document.querySelector('.modal-container')) {
        const btnAdd = card.querySelector(".pokemon-card-base");

        if(btnAdd && origem){
            btnAdd.addEventListener('click', () => {
                if(origem === 'card1'){
                    if(!cardcompare[1] || p.id !== cardcompare[1].id){
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

function salvarLS(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

function buscarLS(chave, padrao = null) {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : padrao;
}

function verificarFavorito(id) {
    return buscarLS('pokemonFavoritos', []).includes(id);
}

async function tentarFavoritar(event, elemento, pokemonId) {
    event.stopPropagation();

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

    if (window.location.pathname.includes('favoritos.html')) {
        carregarFavoritos();
    }
}