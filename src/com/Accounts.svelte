<script>
// list accounts and their balances
import Ether from "./data/Ether.svelte";
import { onMount } from "svelte";
import { createBrowserProvider } from "$lib/model/provider.js";
import Address from "./data/Address.svelte";

export let accounts = []

$: connected = []
$: current = false


const fetchConnectedAccounts = async () => {
    const provider = await createBrowserProvider()
    const accounts = await provider.listAccounts()
    return accounts.map( acc => acc.address.toLowerCase() )
}

onMount( async () => {

    connected = await fetchConnectedAccounts()
    current = connected.length > 0 ? connected[0] : null


    window.ethereum.on( 'accountsChanged', accounts => {
        //https://eips.ethereum.org/EIPS/eip-1193#events
        console.log( 'changed', JSON.stringify( accounts, null, 2 ) )
        connected = accounts
        current = accounts[0] || false
    } )
    window.ethereum.on( 'disconnect', err => {
        //https://eips.ethereum.org/EIPS/eip-1193#events
        console.log( 'disconnected', { err } )
    } )
    window.ethereum.on( 'connect', chainId => {
        //https://eips.ethereum.org/EIPS/eip-1193#events
        console.log( 'connected', { chainId } )
    } )
} )
</script>
<table class="table table-sm font-mono">
    <thead>
        <tr>
            <th class="w-16"></th>
            <th class="w-24">Role</th>
            <th>Address</th>
            <th>Balance</th>
        </tr>
    </thead>
    <tbody>
        {#each accounts as account,i}
            <tr data-address={account.address}>
                <td>
                    <div class="flex items-center gap-x-4">
                        <span
                            class:text-neutral={current===account.address.toLowerCase()}
                            class:text-base-100={current!==account.address.toLowerCase()}
                            class="text-2xl icon-[solar--wallet-2-linear]"
                        ></span>

                        <span
                            class="badge badge-xs"
                            class:badge-success={connected.includes(account.address.toLowerCase())}
                            class:badge-ghost={!connected.includes(account.address.toLowerCase())}
                        ></span>
                    </div>
                </td>
                <td>
                    {#if account.role}
                            <span
                                class="badge text-xs uppercase py-2 w-full font-sans {
                                account.role==='depositor' ? 'badge-warning'
                                : account.role ==='arbiter' ? 'badge-secondary'
                                : account.role==='beneficiary'? 'bg-pink-500 text-white'
                                :''
                                }"
                            >{account.role}</span>
                    {/if}
                </td>
                <td>
                    <Address address={account.address}/>
                </td>
                <td>
                    <Ether wei={account.balance}/>
                </td>
            </tr>
        {/each}
    </tbody>
</table>