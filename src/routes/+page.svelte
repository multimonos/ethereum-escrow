<script>
import { useMachine } from "@xstate/svelte";
import { setup } from "xstate";
import { escrowMachine } from "$lib/escrow-machine.js";
import { networkId } from "$lib/config.js";
import Error from "../com/Error.svelte";
import Accounts from "../com/Accounts.svelte";
import NetworkStatus from "../com/NetworkStatus.svelte";
import { modelOptionsForSelect } from "$lib/form.js";
import Select from "../com/form/Select.svelte";
import StackedLayout from "../com/card/StackedLayout.svelte";
import {abi,bytecode} from "../sol/Escrow.json"


// state mgmt
const machine = setup( {} ).createMachine( escrowMachine )
// const { inspect } = createBrowserInspector( {
//     autoStart: false
// } )
const { snapshot, send } = useMachine( machine, {
    // inspect,
    input: {
        contractAbi: abi,
        contractBytecode: bytecode,
        networkId,
    }
} )

// form
let amount = 0
let arbiter = ""
let beneficiary = ""
$:arbiterOptions = modelOptionsForSelect( {
    data: $snapshot.context.accounts.slice( 1 ),
    label: 'address',
    value: 'address',
} )
$:beneficiaryOptions = modelOptionsForSelect( {
    data: $snapshot.context.accounts.slice( 1 ),
    label: 'address',
    value: 'address',
} )
$:contract = {
    arbiter,
    beneficiary,
    amount
}
const emitSetContract = contract => {
    console.log( 'sent', { contract } )
    send( { type: 'set_contract', contract } )
}
const onChangeArbiter = e => {
    arbiter = e.target.value
    emitSetContract( { ...contract, arbiter } )
}
const onChangeBenenficiary = e => {
    beneficiary = e.target.value;
    emitSetContract( { ...contract, beneficiary } )
}
const onChangeAmount = e => {
    amount = e.target.value;
    emitSetContract( { ...contract, amount } )
}

const onReset = () => {
    arbiter = ""
    beneficiary = ""
    amount = 0
    emitSetContract( { arbiter, beneficiary, amount } )
}
</script>

{#if $snapshot.matches( 'loading' )}
    loading
{:else}
    <StackedLayout>

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

                <div>

                    <Select
                        title="Arbiter"
                        options={arbiterOptions}
                        selected={$snapshot.context.contract.arbiter}
                        on:change={onChangeArbiter}
                    />

                    <Select
                        title="Beneficiary"
                        options={beneficiaryOptions}
                        selected={$snapshot.context.contract.beneficiary}
                        on:change={onChangeBenenficiary}
                    />

                    <div class="form-control">
                        <input
                            type="range"
                            name="amount"
                            min="0"
                            max="10"
                            step=".25"
                            class="range range-xs"
                            on:change={onChangeAmount}
                            bind:value={amount}
                        />
                        <div class="label">
                            <label class="label-text-alt" for="amount">{amount} ether</label>
                        </div>
                    </div>

                    <div class="flex gap-2 my-8">
                        <button
                            disabled={!$snapshot.can({type:'deploy'})}
                            on:click={()=>send({type:'deploy'})}
                            class="btn btn-primary">
                            Deploy
                        </button>
                        <button
                            disabled={!$snapshot.can({type:'approve'})}
                            on:click={()=>send({type:'approve'})}
                            class="btn btn-secondary">
                            Approve
                        </button>
                        <button
                            on:click={onReset}
                            class="btn btn-accent">
                            Reset
                        </button>
                    </div>
                </div>
            {/if}

        </div>
    </StackedLayout>
{/if}
<pre>local:{JSON.stringify( contract, null, 4 )}</pre>
<pre>error:{JSON.stringify( $snapshot.context, null, 4 )}</pre>
<pre>error:{JSON.stringify( $snapshot.context.error, null, 4 )}</pre>
<pre>addre:{JSON.stringify( $snapshot.context.contractAddress, null, 4 )}</pre>
<pre>error:{JSON.stringify( $snapshot.value, null, 4 )}</pre>
<!--<pre>{JSON.stringify( $snapshot.value, null, 4 )}</pre>-->
