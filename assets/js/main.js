const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')

const maxRecords = 151
const limit = 16
let offset = 0;

const modal = document.getElementById("pokemonDetailModal");
const detailContent = document.getElementById("detailContent");
const closeButton = document.querySelector(".close-button");


closeButton.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `
}

function buildDetailModalHtml(pokemon) {
    const weightKg = (pokemon.weight / 10).toFixed(1);
    const heightM = (pokemon.height / 10).toFixed(2);
    const primaryType = pokemon.type; 
    const maxStatValue = 255; 

   
    const statsHtml = pokemon.stats.map(stat => {
       
        const statName = stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').toUpperCase();
        const statValue = stat.base_stat;
        const barWidth = (statValue / maxStatValue) * 100;
        
        return `
            <div class="stat-row">
                <span class="stat-name">${statName}</span>
                <span class="stat-value">${statValue}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar ${primaryType}" style="width: ${barWidth}%;"></div>
                </div>
            </div>
        `;
    }).join('');

    
    const evolutionHtml = pokemon.evolutionChain.map(evoName => {
        const isCurrent = (evoName === pokemon.name);
        

        return `
            <div class="evolution-item">
                <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/${evoName}.gif" alt="${evoName}" class="evolution-img">
                <span class="evolution-name ${isCurrent ? 'current-evo' : ''}">${evoName}</span>
            </div>
        `;
    }).join('<span class="evo-arrow">→</span>'); 

    return `
        <div class="pokemon-detail-card ${primaryType}">
            <div class="detail-header">
                <span class="detail-number">#${pokemon.number}</span>
            </div>
            
            <img src="${pokemon.photo}" alt="${pokemon.name}" class="detail-image">
            <h2 class="detail-name">${pokemon.name}</h2>
            
            <div class="type-container">
                ${pokemon.types.map((type) => `<span class="type-badge ${type}">${type}</span>`).join(' ')}
            </div>

            <div class="info-row">
                <div class="info-item">
                    <p class="info-value">${weightKg} KG</p>
                    <p class="info-label">WEIGHT</p>
                </div>
                <div class="info-item">
                    <p class="info-value">${heightM} M</p>
                    <p class="info-label">HEIGHT</p>
                </div>
            </div>

            <h3 class="detail-section-title">Evolution Chain</h3>
            <div class="evolution-chain-container">
                ${evolutionHtml}
            </div>
            
            <h3 class="detail-section-title">Base Stats</h3>
            <div class="stats-chart">
                ${statsHtml}
            </div>
        </div>
    `;
}



function addClickListenersToPokemonItems() {
    document.querySelectorAll('.pokemon').forEach(li => {
        li.addEventListener('click', (event) => {
            event.stopPropagation(); 
            
            const numberText = li.querySelector('.number').textContent.replace('#', '');
            const pokemonId = parseInt(numberText);

    
            pokeApi.getPokemonById(pokemonId)
                .then(pokemonDetail => {
                    const detailHtml = buildDetailModalHtml(pokemonDetail);
                    detailContent.innerHTML = detailHtml;
                    modal.style.display = "block";
                })
                .catch(error => {
                    console.error("Erro ao buscar detalhes do Pokémon:", error);
                });
        });
    });
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('');
        pokemonList.innerHTML += newHtml;
       
        addClickListenersToPokemonItems(); 
    });
}


loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})