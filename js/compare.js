function scrollCarouselCompare(direction) {
    const container = document.getElementById('divUltimasComparacoes');
    const cardWidth = 270;
    const gap = 64;
    const visibleCards = 1;

    const scrollAmount = (cardWidth + gap) * visibleCards;

    container.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
}

const divUltimasComp = document.getElementById('divUltimasComparacoes');
const carouselContainerComparacao = document.getElementById('carouselContainerComparacao');
const carouselContainerComparacaoTitle = document.getElementById('carouselContainerComparacaoTitle');

if(divUltimasComp){
    
    if(ultimasComparacoes.length){
        carouselContainerComparacaoTitle.innerHTML = "Ultimas Comparações";

        ultimasComparacoes.forEach(compcard => {
            const cardComparacao = document.createElement('div');
            cardComparacao.classList.add('cardComparacao');
            
            cardComparacao.innerHTML = `
                <div class="card-comp-base" >
                    <img src="../assets/img/winner.png" alt="Ganhador" class="card-comp-img-w">
                    <img src="${compcard.ganhador.image}" alt="${compcard.ganhador.name}" class="card-comp-img-poke">
                        
                    <img src="../assets/img/loser.png" alt="Perdedor" class="card-comp-img-l">
                    <img src="${compcard.perdedor.image}" alt="${compcard.perdedor.name}" class="card-comp-img-poke">
                </div>

                <div class="card-comp-info">
                    <div class="card-comp-coluna">
                        <spam class="card-comp-name">${compcard.ganhador.name}</spam>
                        <spam class="card-comp-id">#${compcard.ganhador.id}</spam>
                    </div>

                    <h3 class="card-comp-vs">VS</h3>

                    <div class="card-comp-coluna">
                        <spam class="card-comp-name">${compcard.perdedor.name}</spam>
                        <spam class="card-comp-id">#${compcard.perdedor.id}</spam>
                    </div> 
                </div>
            `;

            divUltimasComp.appendChild(cardComparacao);
        });
    } else{
        carouselContainerComparacao.innerHTML = "";
        carouselContainerComparacaoTitle.innerHTML = "";
    }
     
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

    renderizarFiltradosNoModal(filteredPokemon);

    modalSearchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        
        const resultados = pokemonData.filter(p => 
            p.name.toLowerCase().includes(termo) || 
            p.id.toString().includes(termo)
        );

        renderizarFiltradosNoModal(resultados);
    });

    const fecharModal = () => { modal.innerHTML = ""; };
    
    document.getElementById('fade').addEventListener('click', fecharModal);
    document.getElementById('buttonFecharX').addEventListener('click', fecharModal);

    document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') fecharModal();
});
}

function battle() {

    if(cardcompare[0] && cardcompare[1]){
        let pontuacaoPokemon = [];
        let ganhador = [];
        let perdedor = [];  

        cardcompare[0].attack > cardcompare[1].attack ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;
        cardcompare[0].defense > cardcompare[1].defense ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;
        cardcompare[0].hp > cardcompare[1].hp ? pontuacaoPokemon[0]++ : pontuacaoPokemon[1]++;

        console.log("pontuacaoPokemon01", pontuacaoPokemon[0]);
        console.log("pontuacaoPokemon02", pontuacaoPokemon[1]);

         if(pontuacaoPokemon[0] > pontuacaoPokemon[1]){
            ganhador = cardcompare[0];
            perdedor = cardcompare[1];
         } else {
            ganhador = cardcompare[1];
            perdedor = cardcompare[0];
         }

        const section = document.getElementById('sectionCompare');
        const bannersection = document.querySelector('.hero-div');

        bannersection.style.display = 'none';
        section.style.backgroundColor = 'black';

        section.innerHTML = `
            <div id="battleDiv">
                <img src="../assets/img/animacao1.gif" alt="animacao" id="animacaoBattle">
            </div>
        `;
        
        setTimeout(function() {
            document.getElementById('animacaoBattle').style.display = 'none';
            section.style.backgroundColor = 'transparent';
            renderizarVencedor(ganhador);

            //adiciono aqui os ultimos comparados na Array de historico
            ultimasComparacoes.unshift({
                ganhador: {
                    id: ganhador.id,
                    name: ganhador.name,
                    type: ganhador.type,
                    image: ganhador.image
                },
                perdedor: {
                    id: perdedor.id,
                    name: perdedor.name,
                    type: perdedor.type,
                    image: perdedor.image
                }
            });
            localStorage.setItem('ultimasComparacoes', JSON.stringify(ultimasComparacoes));
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

document.addEventListener("DOMContentLoaded", () => {
    const target = document.querySelector("#sectionCompare");
    if(!target) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                target.style.visibility = 'visible';
                target.style.animation = 'slideUp 0.5s ease forwards';
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8
    });

    observer.observe(target);
});

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

inicializar();