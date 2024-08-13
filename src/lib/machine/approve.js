import { ethers } from "ethers";

const tag = 'approve'

export const approveInput = ( { context } ) => ({
    dbg: true,
    arbiter: context.contract.arbiter,
    abi: context.contractAbi,
    deployment: context.deployments.find(deployment=>deployment.address===context.contractAddress),
})

export const approve = async ( { input } ) => {


    const {
        dbg,
        arbiter,
        abi,
        deployment,
    } = input

    dbg && console.log( tag, '-'.repeat( 8 ), performance.now() )
    console.log({deployment})

    // provider
    const browserProvider = new ethers.BrowserProvider( window.ethereum )
    dbg && console.log( tag, { browserProvider } )

    // signer
    const signer = await browserProvider.getSigner()
    dbg && console.log( tag, { signer } )

    // get contract definition
    const contract = new ethers.Contract(
        deployment.address,
        abi,
        signer
    )
    dbg && console.log( tag, { contract } )

    try {
        // approve
        const txn = await contract.approve()
        dbg && console.log(tag, { txn } )

        const receipt = await txn.wait()
        dbg && console.log( tag, { receipt } )

        // // update accounts
        // const res = await fetch( `/api/accounts` )
        // const json = await res.json()
        // const accounts = json.data
        // dbg && console.log( tag, { accounts } )

        // ux delay
        await new Promise( resolve => setTimeout( resolve, 1500 ) )

       return {success:true}
        // return {
        //     accounts ,
        // }

    } catch ( err ) {

        if ( err.data ) {
            const contractError = contract.interface.parseError( err.data )
            throw new Error( `${contractError.name}` )
        } else {
            // rethrow identical err
            throw err
        }
    }
}