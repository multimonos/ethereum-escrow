import { ethers } from "ethers";
import { provider } from "$lib/model/provider.js";

const tag = 'deploy'
export const deployInput = ( { context } ) => ({
    dbg: true,

    // core
    provider: context.provider,

    // data
    arbiter: context.contract.arbiter,
    beneficiary: context.contract.beneficiary,
    amount: context.contract.amount,

    // escrow meta data
    abi: context.contractAbi,
    bytecode: context.contractBytecode,
})

export const deploy = async ( { input } ) => {

    const {
        dbg,
        arbiter,
        beneficiary,
        amount,
        abi,
        bytecode,
        provider,
    } = input

    dbg && console.log( tag, '-'.repeat( 8 ), performance.now() )
    dbg && console.log( tag, { arbiter, beneficiary, amount } )

    // provider
    // const provider = new ethers.BrowserProvider( window.ethereum )
    dbg && console.log( tag, {  provider } )

    // signer
    const signer = await provider.getSigner()
    dbg && console.log( tag, { signer } )

    // prepare
    const factory = new ethers.ContractFactory(
        abi,
        bytecode,
        signer
    )
    dbg && console.log( tag, { factory } )

    // set value
    const value = ethers.parseEther( amount.toString() ).toString()
    dbg && console.log( tag, { value } )

    // deploy
    const contract = await factory.deploy( arbiter, beneficiary, { value } )
    dbg && console.log( tag, { contract } )

    // receipt
    const receipt = await contract.waitForDeployment()
    dbg && console.log( tag, { receipt } )

    // get contract balance
    const contractBalance = await provider.getBalance( contract.target )
    dbg && console.log( tag, { contractBalance} )

    // contract address
    const contractAddress = contract.target
    dbg && console.log( tag, { contractAddress } )

    // ux delay
    await new Promise( resolve => setTimeout( resolve, 1500 ) )

    return {
        contractBalance,
        contractAddress,
    }
}