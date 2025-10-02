
const pokeApi = {}


function getEvolutionChainNames(chain) {
    const evolutionChain = [];


    function traverseChain(currentChain) {
        evolutionChain.push(currentChain.species.name);

        if (currentChain.evolves_to.length > 0) {
            traverseChain(currentChain.evolves_to[0]);
        }
    }

    traverseChain(chain);
    return evolutionChain;
}


pokeApi.getEvolutionChain = (speciesUrl) => {
    return fetch(speciesUrl)
        .then(response => response.json())
        .then(speciesDetail => {
            const chainUrl = speciesDetail.evolution_chain.url;
            return fetch(chainUrl);
        })
        .then(response => response.json())
        .then(evolutionDetail => getEvolutionChainNames(evolutionDetail.chain));
}


function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.versions['generation-v']['black-white'].animated.front_default

    pokemon.weight = pokeDetail.weight
    pokemon.height = pokeDetail.height
    pokemon.stats = pokeDetail.stats.map(statSlot => ({
        name: statSlot.stat.name,
        base_stat: statSlot.base_stat
    }))


    pokemon.speciesUrl = pokeDetail.species.url;

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}

pokeApi.getPokemonById = (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;

    return fetch(url)
        .then((response) => response.json())
        .then(pokeDetail => {
            const pokemon = convertPokeApiDetailToPokemon(pokeDetail);

            return pokeApi.getEvolutionChain(pokemon.speciesUrl)
                .then(evolutionChain => {
                    pokemon.evolutionChain = evolutionChain;
                    return pokemon;
                });
        });
};