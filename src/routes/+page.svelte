<script>
import { useMachine } from "@xstate/svelte";
import { createMachine } from "xstate";
import { escrowMachine } from "$lib/escrow-machine.js";
import { createBrowserInspector } from "@statelyai/inspect";
import { networkId } from "$lib/config.js";
import Error from "../com/Error.svelte";
import Accounts from "../com/Accounts.svelte";
import NetworkStatus from "../com/NetworkStatus.svelte";


// state mgmt
const machine = createMachine( escrowMachine )
const { inspect } = createBrowserInspector( {
    autoStart: false
} )
const { snapshot, send } = useMachine( machine, {
    inspect,
    input: {
        networkId,
    }
} )
</script>

{#if $snapshot.matches( 'loading' )}
    loading
{:else}
    <header class="mb-8 flex items-end gap-x-4 justify-between">
        <div class="flex flex-col">
            <h2 class="text-xs uppercase">Alchemy Ethereum Bootcamp</h2>
            <h1 class="text-3xl">Escrow Contract</h1>
        </div>

        <div>
            <NetworkStatus network={$snapshot.context.network}/>
        </div>
    </header>

    <div class="flex flex-col gap-4">

        {#if $snapshot.context.error}
            <Error message={$snapshot.context.error}/>
        {/if}

        {#if $snapshot.context.network.available}
            <Accounts accounts={$snapshot.context.accounts}/>
        {/if}
    </div>
{/if}
