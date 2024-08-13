import { anvilAccounts } from "./anvil-accounts.js";
import { toHex } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// import { eq } from "drizzle-orm"
// import { db } from "$lib/server/db.js";

const model = sqliteTable( "accounts", {
    id: integer( "id", { mode: "number" } ).primaryKey( { autoIncrement: true } ),
    address: text( "address" ),
    publicKey: text( "public_key" ),
    balance: integer( "balance", { mode: "number" } )
} )

const createPublicKey = ( privateKey ) =>
    toHex( secp256k1.getPublicKey( privateKey, false ) )

// export const resetAccounts = async () => {
//
//     await db.delete( model )
//
//     const data = anvilAccounts.map( x => ({
//         id: x.id,
//         address: x.address,
//         balance: x.balance,
//         publicKey: createPublicKey( x.privateKey )
//     }) )
//     const rs = await db.insert( model ).values( data )
// }

export const createAccount = (
    {
        address = "",
        balance = 0,
        role = "",
        connected=false,
        active=false,
    } = {} ) => (
    {
        type: "account",
        address,
        balance: balance,
        role,
        connected,
        active,
    })

export const getAccounts = async ( provider ) => {
    const prm = anvilAccounts.map( acct => provider.getBalance( acct.address ) )

    const res = await Promise.all( prm )

    const accounts = anvilAccounts
        .map( createAccount )
        .map( ( acct, i ) => ({ ...acct, balance: res[i].toString() }) )

    return accounts
}
//
// export const accountFromAddress = async ( address ) => {
//     const rs = await db.select()
//         .from( model )
//         .where( eq( model.address, address ) )
//         .limit( 1 )
//
//     return rs.length === 1
//         ? createAccount( { ...rs[0] } )
//         : false
// }
//
// export const accountFromPublicKey = async ( publicKey ) => {
//     const rs = await db.select()
//         .from( model )
//         .where( eq( model.publicKey, publicKey ) )
//         .limit( 1 )
//
//     return rs.length === 1
//         ? createAccount( { ...rs[0] } )
//         : false
// }
//
// export const setAccountBalance = async ( account, newBalance ) => {
//     const rs = await db.update( model )
//         .set( { balance: newBalance } )
//         .where( eq( model.address, account.address ) )
// }
//
// export const privateKeyFor = address => {
//     // dangerous !!!
//     const account = anvilAccounts.find( x => x.address === address )
//     return account ? account.privateKey : false
// }
