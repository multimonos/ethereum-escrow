import { anvilAccounts } from "./anvil-accounts.js";
import { toHex } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const model = sqliteTable( "accounts", {
    id: integer( "id", { mode: "number" } ).primaryKey( { autoIncrement: true } ),
    address: text( "address" ),
    publicKey: text( "public_key" ),
    balance: integer( "balance", { mode: "number" } )
} )

const createPublicKey = ( privateKey ) =>
    toHex( secp256k1.getPublicKey( privateKey, false ) )

export const createAccount = (
    {
        address = "",
        balance = 0,
        role = "",
        connected = false,
        active = false,
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


export const setRoleFromContract = ( account, contract ) => {
    if ( contract?.arbiter === account.address ) {
        account.role = 'arbiter'
    } else if ( contract?.beneficiary === account.address ) {
        account.role = 'beneficiary'
    } else if ( contract?.depositor === account.address ) {
        account.role = 'depositor'
    } else {
        account.role = ''
    }
    return account
}

