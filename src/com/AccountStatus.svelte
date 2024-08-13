<script>

import { onMount } from "svelte";
import { ethers } from "ethers";

$:count = 0

const refresh = async () => {
    if ( typeof window === 'undefined' ) {
        return count = 0
    }
    if ( typeof window.ethereum === 'undefined' ) {
        return count = 0
    }

    const accounts = await window.ethereum.request( { method: 'eth_accounts' } )
    count = accounts.length
}

const connect = async () => {
    console.log( 'connect' )
    try {
        const provider = new ethers.BrowserProvider( window.ethereum )
        const signer = await provider.getSigner()
    } catch ( err ) {
        console.error( 'connect', { err } )
    }
}
onMount( () => {
    refresh()
    setInterval( refresh, 3000 )
} )
</script>
<div class="flex justify-between items-center gap-x-2 text-xs">

    {#if count}
        <span>Accounts</span>
        <span class="text-lg text-success icon-[solar--check-square-linear]"></span>
    {:else}
        <button class="link hover:no-underline" on:click={connect}>Connect</button>
        <span class="text-lg text-error icon-[solar--danger-square-linear]"></span>
    {/if}
</div>
