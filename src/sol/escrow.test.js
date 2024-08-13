import { assert, beforeAll, describe, it } from "vitest";
import { ethers } from "ethers";
import { anvilAccounts } from "$lib/model/anvil-accounts.js";
import manifest from "./Escrow.json"
import { provider } from "$lib/model/provider.js";


describe( `Escrow`, () => {

    let signer
    let arbiter
    let beneficiary
    const deposit = ethers.parseEther( '5' )

    beforeAll( async () => {
        arbiter = new ethers.Wallet( anvilAccounts[1].privateKey, provider )
        beneficiary = new ethers.Wallet( anvilAccounts[2].privateKey, provider )
        signer = new ethers.Wallet( anvilAccounts[0].privateKey, provider )
    } )

    describe( `setup`, () => {
        it( `signer`, async () => {
            assert.isString( signer.address )
            assert.isNotEmpty( signer.address )
            assert.isTrue( signer.address.startsWith( '0x' ) )
            assert.isNotEmpty( signer.privateKey )
        } )
        it( `arbiter`, async () => {
            assert.isString( arbiter.address )
            assert.isNotEmpty( arbiter.address )
            assert.isTrue( arbiter.address.startsWith( '0x' ) )
            assert.isNotEmpty( arbiter.privateKey )
        } )
        it( `benificiary`, async () => {
            assert.isString( beneficiary.address )
            assert.isNotEmpty( beneficiary.address )
            assert.isTrue( beneficiary.address.startsWith( '0x' ) )
            assert.isNotEmpty( beneficiary.privateKey )
        } )
        it( `deposit`, async () => {
            assert.typeOf( deposit, 'bigint' )
        } )

        describe( `manifest`, () => {
            it( `.bytecode`, async () => {
                assert.property( manifest, 'bytecode' )
                assert.isNotEmpty( manifest.bytecode )
            } )
            it( `.abi[]`, async () => {
                assert.property( manifest, 'abi' )
                assert.isArray( manifest.abi )
            } )
            it( `.abi.constructor()`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'constructor' ) )
            } )
            it( `.abi.approve()`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'function' && x.name === 'approve' ) )
            } )
            it( `.abi.isApproved()`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'function' && x.name === 'isApproved' ) )
            } )
            it( `.abi.arbiter()`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'function' && x.name === 'arbiter' ) )
            } )
            it( `.abi.beneficiary()`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'function' && x.name === 'beneficiary' ) )
            } )
            it( `.abi.ArbiterOnly error`, async () => {
                assert.isNotNull( manifest.abi.find( x => x.type === 'error' && x.name === 'ArbiterOnly' ) )
            } )
        } )

    } )


    describe( `deployment with ethers`, () => {
        describe( `successful approval`, () => {
            let contract

            beforeAll( async () => {

                // --- deployment ---
                const factory = new ethers.ContractFactory(
                    manifest.abi,
                    manifest.bytecode,
                    signer
                )

                contract = await factory.deploy( arbiter, beneficiary, { value: deposit } );

                // wait for the contract to be mined
                const receipt = await contract.waitForDeployment()

                // get contract balance
                const balance = await provider.getBalance( contract.target )

                console.log( { contract, receipt, balance } )
            } )


            it( `deployed to an address`, async () => {
                assert.isString( contract.target )
                assert.isTrue( contract.target.startsWith( '0x' ) )
            } )

            it( `initial deposit of 5 ether was made`, async () => {
                const val = await provider.getBalance( contract.target )
                assert.equal( deposit, val )
            } )

            it( `approval() transfers funds to beneficiary`, async () => {
                const initialBalance = await provider.getBalance( beneficiary.address )

                // write
                const tx = await contract.connect( arbiter ).approve()
                await tx.wait()

                //read
                const finalBalance = await provider.getBalance( beneficiary.address )
                const contractBalance = await provider.getBalance( contract.target )
                const approved = await contract.isApproved()

                console.log( {
                    initialBalance,
                    finalBalance,
                    contractBalance,
                    approved
                } )

                assert.equal( initialBalance + deposit, finalBalance, 'beneficiary receives the deposit' )
                assert.equal( 0, contractBalance, 'contract balance is exhausted' )
                assert.isTrue( approved, 'contract marked as approved' )
            } )

        } )

        describe( `failed approval`, () => {
            let contract

            beforeAll( async () => {

                // --- deployment ---
                const factory = new ethers.ContractFactory(
                    manifest.abi,
                    manifest.bytecode,
                    signer
                )

                contract = await factory.deploy( arbiter, beneficiary, { value: deposit } );

                // wait for the contract to be mined
                const receipt = await contract.waitForDeployment()

                // get contract balance
                const balance = await provider.getBalance( contract.target )

                console.log( { contract, receipt, balance } )
            } )

            it( `deployed to an address`, async () => {
                assert.isString( contract.target )
                assert.isTrue( contract.target.startsWith( '0x' ) )
            } )

            it( `initial deposit of 5 ether was made`, async () => {
                const val = await provider.getBalance( contract.target )
                assert.equal( deposit, val )
            } )

            it( `arbiter must approve`, async () => {

                let customError
                // write
                try {
                    const tx = await contract.connect( beneficiary ).approve()
                    await tx.wait()
                } catch ( err ) {
                    console.log( JSON.stringify( err, null, 4 ) )
                    customError = contract.interface.parseError( err.data )
                    console.log( { customError } )
                }

                //read
                const contractBalance = await provider.getBalance( contract.target )
                const approved = await contract.isApproved()


                console.log( {
                    contractBalance,
                    approved
                } )

                assert.equal( deposit, contractBalance, 'contract balance unchanged' )
                assert.isFalse( approved, 'approval failed' )
                assert.property( customError, 'name' )
                assert.equal( customError.name, 'ArbiterOnly' )
            } )
        } )

    } )

} )