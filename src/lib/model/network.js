export const createNetwork = (
    {
        id = '',
        name = '',
        url = '',
        available = false,
    } = {} ) => (
    {
        id,
        name,
        url,
        available,
    }
)

const networks = [
    createNetwork( {
        id: "ganache",
        name: "Ganache",
        url: "http://127.0.0.1:7545",
    } ),
    createNetwork( {
        id: "eth_sepolia",
        name: "Sepolia",
        url: "https://eth.llamarpc.com",
    } ),
    createNetwork( {
        id: "anvil",
        name: "Anvil",
        url: "http://127.0.0.1:8545",
    } ),
]

export const findNetwork = id =>
    networks.find( network => network.id === id )

export const setNetworkStatus = async ( network ) => {

    try {
        const res = await fetch( network.url, {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify( {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_chainId',
                params: []
            } )
        } )

        network.available = res.ok

    } catch ( err ) {
        network.available = false
    }

    return network
}

export const createNetworkOptions = ( selectedId ) =>
    networks.map( x => ({
        label: x.name,
        value: x.id,
        selected: selectedId === x.id
    }) )
