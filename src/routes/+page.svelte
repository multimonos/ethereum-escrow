<script>
import { onMount } from "svelte";
import Error from "../com/Error.svelte";
import Accounts from "../com/Accounts.svelte";
import { networkId } from "$lib/config.js";
import NetworkStatus from "../com/NetworkStatus.svelte";
import { useMachine } from "@xstate/svelte";
import { createMachine } from "xstate";
import { escrowMachine } from "$lib/escrow-machine.js";
import { createBrowserInspector } from "@statelyai/inspect";

// state mgmt
const machine = createMachine( escrowMachine )
const { inspect } = createBrowserInspector( {
    autoStart: true
} )
const { snapshot, send } = useMachine( machine, {
    inspect,
    input: {}
} )


//vars
let message = {}
let signature = ""

let accountList = []
$:accounts = $snapshot.context.accounts

// errors
let error
$: hasError = typeof error === "string" && error !== ""

// fns
const setError = message => {
    error = message
    setTimeout( () => error = "", 4000 )
}
const fetchAccounts = async () => {
    const res = await fetch( `/api/accounts` )
    if ( ! res.ok ) return []
    const { data } = await res.json()
    return data
}

onMount( async () => {
    accounts = await fetchAccounts()
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
            <NetworkStatus network={$snapshot.context.network} />
        </div>
    </header>

    <div class="flex flex-col gap-4">

        {#if hasError}
            <Error message={error}/>
        {/if}

        <Accounts {accounts}/>
    </div>
{/if}
