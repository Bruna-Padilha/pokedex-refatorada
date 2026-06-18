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
            const cardBase = card.querySelector('.pokemon-card-base');
            
            cardBase.addEventListener('click', (e) => {
                salvarPokemonNosFavoritos(pokemon.id);
            });

            const expandBtn = card.querySelector('.expand-btn');
            const detailsPanel = card.querySelector('.details-panel');

            if (expandBtn) {
                expandBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            if (detailsPanel) {
                detailsPanel.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
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

inicializar();