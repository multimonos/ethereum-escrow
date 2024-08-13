<script>
import { useMachine } from "@xstate/svelte";
import { setup } from "xstate";
import { onMount } from "svelte";
import { modelOptionsForSelect } from "$lib/form.js";
import { escrowMachine } from "$lib/machine/escrow-machine.js";
import { networkId } from "$lib/config.js";
import { abi, bytecode } from "../sol/Escrow.json"
import AccountStatus from "../com/AccountStatus.svelte";
import Accounts from "../com/Accounts.svelte";
import Card from "../com/card/Card.svelte";
import Deployments from "../com/Deployments.svelte";
import Error from "../com/Error.svelte";
import FormRow from "../com/form/FormRow.svelte";
import Label from "../com/form/Label.svelte";
import NetworkStatus from "../com/NetworkStatus.svelte";
import Select from "../com/form/Select.svelte";
import StackedLayout from "../com/card/StackedLayout.svelte";
import Steps from "../com/Steps.svelte";
import Title from "../com/card/Title.svelte";
import Toasts from "../com/Toasts.svelte";
import WalletStatus from "../com/WalletStatus.svelte";


// state mgmt
const machine = setup( {} ).createMachine( escrowMachine )
// const { inspect } = createBrowserInspector( {
//     autoStart: false
// } )
const { snapshot, send } = useMachine( machine, {
    // inspect,
    input: {
        dbg: false,
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
} )
</script>

{#if $snapshot.matches( 'preparing' )}
    <div>
        <span class="loading loading-dots loading-xs"></span>
    </div>
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

        {#if $snapshot.context.error}
            <Error message={$snapshot.context.error}/>
        {/if}

        {#if $snapshot.context.network.available}
            <Card>
                <Title>Accounts</Title>
                <Accounts accounts={$snapshot.context.accounts}/>
            </Card>

            <Card>
                <Title>Escrow Contract</Title>

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
                        <div class="form-control  flex flex-row items-center gap-x-2">
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
                            <span class="text-sm w-32">{amount} Ether</span>
                        </div>
                    </FormRow>

                    <div class="flex gap-4 mt-8 justify-between">
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
                </div>
            </Card>

            {#if $snapshot.context.deployments.length > 0}
                <Card>
                    <Title>Deloyments</Title>
                    <Deployments deployments={$snapshot.context.deployments}/>
                </Card>
            {/if}
        {/if}
    </StackedLayout>
{/if}

{#if $snapshot.context.dbg}
    <pre>deployments:{JSON.stringify( $snapshot.context.deployments, null, 4 )}</pre>
    <!--<pre>statematch:{$snapshot.matches( { running: { ready: 'valid' } } )}</pre>-->
    <!--<pre>state:{JSON.stringify( $snapshot.value, null, 4 )}</pre>-->
    <!--<pre>toasts:{JSON.stringify( $snapshot.context.toasts, null, 4 )}</pre>-->
    <!--<pre>local:{JSON.stringify( contract, null, 4 )}</pre>-->
    <!--<pre>error:{JSON.stringify( $snapshot.context, null, 4 )}</pre>-->
    <!--<pre>error:{JSON.stringify( $snapshot.context.error, null, 4 )}</pre>-->
    <!--<pre>addre:{JSON.stringify( $snapshot.context.contractAddress, null, 4 )}</pre>-->
    <!--<pre>{JSON.stringify( $snapshot.value, null, 4 )}</pre>-->
{/if}
