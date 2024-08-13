import { assert, beforeAll, describe, it } from "vitest";
import { abi, bytecode } from "../../sol/Escrow.json"
import { deployInput } from "$lib/machine/deploy.js";

describe( `deploy`, () => {
    let input

    beforeAll( () => {
        const context = {
            dbg: false,
            contract: {
                arbiter: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                beneficiary: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
                amount: 0.5,
            },
            contractAbi: abi,
            contractBytecode: bytecode,
        }

        input = deployInput( { context } )
    } )

    describe( `input`, () => {
        it( `arbiter is non-empty string`, async () => {
            assert.isNotEmpty( input.arbiter )
            assert.isString( input.arbiter )
        } )
        it( `beneficiary is non-empty string`, async () => {
            assert.isNotEmpty( input.beneficiary )
            assert.isString( input.beneficiary )
        } )
        it( `amount is non-zero uint`, async () => {
            assert.isNumber( input.amount )
            assert.isAbove( input.amount, 0 )
        } )
        it( `abi is array`, async () => {
            assert.isArray( input.abi )
            assert.lengthOf( input.abi, 8 )
        } )
        it( `bytecode is object`, async () => {
            assert.isObject( input.bytecode )
            assert.property(input.bytecode,'object')
            assert.property(input.bytecode,'sourceMap')
            assert.property(input.bytecode,'linkReferences')
        } )
    } )

    it( `success`, async () => {

    } )
} )