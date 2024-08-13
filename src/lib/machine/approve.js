import { ethers } from "ethers";

export const approveInput = ( { context } ) => ({
    dbg: false,
    arbiter: context.contract.arbiter,
    abi: context.contractAbi,
    contractAddress: context.contractAddress
})

export const approve = async ( { input } ) => {


    const {
        dbg,
        arbiter,
        abi,
        contractAddress,
    } = input


    // provider
    const browserProvider = new ethers.BrowserProvider( window.ethereum )
    dbg && console.log( 'approve', { browserProvider } )

    // signer
    const signer = await browserProvider.getSigner()
    dbg && console.log( 'approve', { signer } )

    // get contract definition
    const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
    )
    dbg && console.log( 'approve', { contract } )

    try {
        // approve
        const txn = await contract.approve()
        dbg && console.log( 'approve', { txn } )

        const receipt = await txn.wait()
        dbg && console.log( 'approve', { receipt } )

        // update accounts
        const res = await fetch( `/api/accounts` )
        const json = await res.json()
        const accounts = json.data
        dbg && console.log( 'approve', { accounts } )

        // ux delay
        await new Promise( resolve => setTimeout( resolve, 1500 ) )

        return { accounts }

    } catch ( err ) {


        if ( err.data ) {
            const contractError = contract.interface.parseError( err.data )
            throw new Error(`${contractError.name}`)
        } else {
            // rethrow identical err
            throw err
        }
    }
}