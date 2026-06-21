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

    if (pokemonData.length === 0) {
        await carregarPokedex();
    } // Se pokemonData não estiver carregado, espera carregarPokedex() antes de continuar

    try {
        const favIds = buscarLS('pokemonFavoritos', []);
        const pokemonsFavoritos = pokemonData.filter(p => favIds.includes(p.id));
        
        //Fallback que busca pokemons avulsos caso a pokedex nao tenha sido carregada por completo
        for (const id of favIds) {
            const jaCarregado = pokemonsFavoritos.some(p => p.id === id);
            if (!jaCarregado) {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const details = await res.json();
                    const pokemonAvulso = {
                        id: details.id,
                        name: sanitizarNomePokemon(details.name),
                        type: details.types.map(t => t.type.name),
                        hp: details.stats.find(s => s.stat.name === 'hp').base_stat,
                        attack: details.stats.find(s => s.stat.name === 'attack').base_stat,
                        defense: details.stats.find(s => s.stat.name === 'defense').base_stat,
                        moves: details.moves.slice(0, 2).map(m => m.move.name),
                        image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default
                    };
                    pokemonData.push(pokemonAvulso);
                    pokemonsFavoritos.push(pokemonAvulso);
                } catch (erro) {
                    console.error(`Erro ao buscar Pokémon favoritado avulso #${id}:`, erro);
                }
            }
        }

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

//variável de paginação do modal
let modalItemsToShow = 30;

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
                <div id="loadMoreModalSentinel" style="height: 1px; width: 100%;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
        if (event.target === modal) fecharModalFavoritos();
    });

    const sentinel = document.getElementById('loadMoreModalSentinel');
    if (sentinel) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                //paginação local acessando a memória local, sem necessidade de novas requisições
                if (entry.isIntersecting) {
                    modalItemsToShow += 30;
                    filtrarPokemonsModalFavoritos();
                }
            });
        }, {
            root: document.getElementById('listaPokemonsModal'),
            threshold: 0.1
        });

        observer.observe(sentinel);
    }
}

async function adicionarFavoritoManual() {
    criarModalFavoritos();

    const modal = document.getElementById('modalFavoritos');
    modal.classList.add('ativo');

    modalItemsToShow = 30; // Resetar para o valor inicial a cada abertura do modal

    const inputBusca = document.getElementById('buscaPokemonFavorito');
    if (inputBusca) {
        inputBusca.value = '';
        inputBusca.focus();
    }

    //Atualiza o modal caso os pokemons sejam carregados depois do modal ser aberto
    window.addEventListener('pokemonsAtualizados', filtrarPokemonsModalFavoritos);

    const grid = document.getElementById('listaPokemonsModalGrid');
    if (grid) {
        grid.innerHTML = '<div class="modal-sem-resultado">Carregando Pokémons...</div>';
    }

    await carregarMaisModalFavoritos();
}

function fecharModalFavoritos() {
    const modal = document.getElementById('modalFavoritos');
    if (modal) modal.classList.remove('ativo');
    
    // Remove o listener para evitar chamadas desnecessárias quando o modal estiver fechado
    window.removeEventListener('pokemonsAtualizados', filtrarPokemonsModalFavoritos);
}


function filtrarPokemonsModalFavoritos() {
    const inputBusca = document.getElementById('buscaPokemonFavorito');
    if (!inputBusca) return;

    const filtrados = buscarPokemonsPorTermo(pokemonData, inputBusca.value);

    renderizarPokemonsModalFavoritos(filtrados, inputBusca.value.trim() !== '');
}

function renderizarPokemonsModalFavoritos(listaPokemons, estaPesquisando) {
    const grid = document.getElementById('listaPokemonsModalGrid');
    if (!grid) return;

    const favIds = buscarLS('pokemonFavoritos', []);
    grid.innerHTML = '';

    if (listaPokemons.length === 0) {
        grid.innerHTML = `<div class="modal-sem-resultado">Nenhum Pokémon encontrado.</div>`;
        return;
    }

    const mostrar = estaPesquisando ? listaPokemons : listaPokemons.slice(0, modalItemsToShow);

    mostrar.forEach(pokemon => {
        const jaAdicionado = favIds.includes(pokemon.id);

        renderizarCard(pokemon, grid, true, null);

        const card = grid.lastElementChild;

        if (jaAdicionado) {
            card.style.opacity = '0.45';
            card.style.pointerEvents = 'none';
        } else {
            const cardBase = card.querySelector('.pokemon-card-base');
            if (cardBase) {
                cardBase.addEventListener('click', () => {
                    toggleFavorito(pokemon.id, cardBase);
                    fecharModalFavoritos();
                });
            }

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

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') fecharModalFavoritos();
});

inicializar();