import { createNetworkProvider } from "$lib/model/provider.js";
import { getAccounts, setRoleFromContract } from "$lib/model/account.js";
import { findNetwork, setNetworkStatus } from "$lib/model/network.js";
import { delay } from "$lib/machine/actions.js";

export const createPrepareInput = ( { context } ) => ({
    networkId: context.networkId,
    contract: context.contract,
})

export const prepare = async ( { input } ) => {

    const {
        networkId,
        contract,
    } = input

    // provider
    const provider = createNetworkProvider()

    // acounts
    const tmpAccounts = await getAccounts( provider )
    const accounts = tmpAccounts.map( account => setRoleFromContract( account, contract ) )

    // network
    const network = findNetwork( networkId )
    await setNetworkStatus( network )

    // ux delay
    await delay( 1500)

    return {
        accounts,
        network,
    };
}