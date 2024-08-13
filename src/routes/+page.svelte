<script>
import { useMachine } from "@xstate/svelte";
import { setup } from "xstate";
import { escrowMachine } from "$lib/machine/escrow-machine.js";
import { networkId } from "$lib/config.js";
import Error from "../com/Error.svelte";
import Accounts from "../com/Accounts.svelte";
import NetworkStatus from "../com/NetworkStatus.svelte";
import { modelOptionsForSelect } from "$lib/form.js";
import Select from "../com/form/Select.svelte";
import StackedLayout from "../com/card/StackedLayout.svelte";
import { abi, bytecode } from "../sol/Escrow.json"
import WalletStatus from "../com/WalletStatus.svelte";
import AccountStatus from "../com/AccountStatus.svelte";
import { onMount } from "svelte";
import Toasts from "../com/Toasts.svelte";
import Steps from "../com/Steps.svelte";
import Card from "../com/card/Card.svelte";
import Label from "../com/form/Label.svelte";
import FormRow from "../com/form/FormRow.svelte";


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
onMount( () => {
    // setTimeout( () => { send( { type: 'toast', toast: { type: 'success', message: 'one:success yo yo yo', created_at: performance.now() } } ) }, 1000 )
    // setTimeout( () => { send( { type: 'toast', toast: { type: 'info', message: 'three:info yo yo yo', created_at: performance.now() } } ) }, 4000 )
    // setTimeout( () => { send( { type: 'toast', toast: { type: 'error', message: 'two:error yo yo yo', created_at: performance.now() } } ) }, 2000 )
    // setTimeout( () => { send( { type: 'toast', toast: { type: 'warning', message: 'four:warning yo yo yo', created_at: performance.now() } } ) }, 6000 )
} )
</script>

{#if $snapshot.matches( 'loading' )}
    loading
{:else}
    <StackedLayout>

        <Toasts toasts={$snapshot.context.toasts}/>

        <header class="mb-8 flex items-end gap-x-4 justify-between">
            <div class="flex flex-col">
                <h2 class="text-xs uppercase">Alchemy Ethereum Bootcamp</h2>
                <h1 class="text-3xl">Escrow Contract</h1>
            </div>

            <div class="flex flex-col gap-1">
                <NetworkStatus network={$snapshot.context.network}/>
                <WalletStatus/>
                <AccountStatus/>
            </div>
        </header>

        <div class="flex flex-col gap-12">

            {#if $snapshot.context.error}
                <Error message={$snapshot.context.error}/>
            {/if}

            {#if $snapshot.context.network.available}

                <Card>
                    <Accounts accounts={$snapshot.context.accounts}/>
                </Card>

                <Card>

                    <div class="mb-12">
                    <Steps state={$snapshot.value}/>
                    </div>

                    <div class="flex flex-col gap-4">
                        <FormRow>
                            <Label>Arbiter</Label>
                            <div class="form-control">
                                <Select
                                    options={arbiterOptions}
                                    selected={$snapshot.context.contract.arbiter}
                                    on:change={onChangeArbiter}
                                />
                            </div>
                        </FormRow>
                        <FormRow>
                            <Label>Beneficiary</Label>
                            <div class="form-control">
                                <Select
                                    options={beneficiaryOptions}
                                    selected={$snapshot.context.contract.beneficiary}
                                    on:change={onChangeBenenficiary}
                                />
                            </div>
                        </FormRow>
                        <FormRow>
                            <Label>Value</Label>
                            <div class="form-control">
                                <input
                                    type="range"
                                    name="amount"
                                    min="0"
                                    max="10"
                                    step=".25"
                                    class="range range-xs w-full ml-3"
                                    on:change={onChangeAmount}
                                    bind:value={amount}
                                />
                            </div>
                        </FormRow>

                        <div class="flex gap-2 mt-8 justify-between">
                            <div>
                                <button
                                    disabled={!$snapshot.can({type:'deploy'})}
                                    on:click={()=>send({type:'deploy'})}
                                    class="btn btn-warning w-32">
                                    <span>Deploy</span>
                                    {#if $snapshot.matches( { running: { ready: 'deploying' } } )}
                                        <span class="loading loading-spinner loading-xs"></span>
                                    {/if}
                                </button>
                                <button
                                    disabled={!$snapshot.can({type:'approve'})}
                                    on:click={()=>send({type:'approve'})}
                                    class="btn btn-secondary w-32">
                                    <span>Approve</span>
                                    {#if $snapshot.matches( { running: { ready: 'approving' } } )}
                                        <span class="loading loading-spinner loading-xs"></span>
                                    {/if}
                                </button>
                            </div>
                            <div>
                                <button
                                    on:click={onReset}
                                    class="btn btn-accent">
                                    Reset
                                </button>
                            </div>
                        </div>
                </Card>

                {#if $snapshot.context.contractAddress}
                    <div class="flex items-center gap-2">
                        <span>Deployed to</span>
                        <code>{$snapshot.context.contractAddress}</code>
                    </div>
                {/if}
            {/if}

        </div>
    </StackedLayout>
{/if}
<pre>statematch:{$snapshot.matches( { running: { ready: 'valid' } } )}</pre>
<pre>state:{JSON.stringify( $snapshot.value, null, 4 )}</pre>
<pre>toasts:{JSON.stringify( $snapshot.context.toasts, null, 4 )}</pre>
<pre>local:{JSON.stringify( contract, null, 4 )}</pre>
<pre>error:{JSON.stringify( $snapshot.context, null, 4 )}</pre>
<pre>error:{JSON.stringify( $snapshot.context.error, null, 4 )}</pre>
<pre>addre:{JSON.stringify( $snapshot.context.contractAddress, null, 4 )}</pre>
<!--<pre>{JSON.stringify( $snapshot.value, null, 4 )}</pre>-->
