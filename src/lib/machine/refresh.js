import { createNetworkProvider } from "$lib/model/provider.js";
import { ethers } from "ethers";
import { getAccounts, setRoleFromContract } from "$lib/model/account.js";

const tag  ='refresh'

export const createRefreshInput = ( { context } ) => ({
    dbg: context.dbg,
    abi: context.contractAbi,
    contract: context.contract,
    accounts: context.accounts,
    deployments: context.deployments,
})


export const refresh = async ( { input } ) => {

    const {
        dbg,
        abi,
        contract,
        deployments,
        // accounts,
    } = input

    dbg && console.log( tag, '-'.repeat( 8 ), performance.now() )

    const provider = createNetworkProvider()
    dbg && console.log( tag, { provider } )


    //accounts
    const res = await fetch( `/api/accounts` )
    const json = await res.json()
    // const accounts = json.data
    const tmpAccounts = await getAccounts( provider )
    const accounts = tmpAccounts.map( account => setRoleFromContract( account, contract ) )
    dbg && console.log( tag, { accounts } )


    // deployments
    dbg && console.log( tag, { deployments } )

    for ( let i = 0; i < deployments.length; i++ ) {
        const address = deployments[i].address
        dbg && console.log( tag, { address } )

        const escrow = new ethers.Contract( deployments[i].address, abi, provider )
        dbg && console.log( tag, { escrow } )

        const balance = await provider.getBalance( deployments[i].address )
        deployments[i].balance = balance.toString()
        dbg && console.log( tag, { balance } )

        const approved = await escrow.isApproved()
        deployments[i].approved = approved
        dbg && console.log( tag, { approved } )
    }
    dbg && console.log( tag, { deployments } )

    return {
        accounts,
        deployments,
    }
}
