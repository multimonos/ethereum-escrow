<script>
import { findNetwork } from "$lib/model/network.js";
import { onMount } from "svelte";

//props
export let id
export let frequency = 5000

// vars
let interval
$:network = findNetwork( id )

// fns
const refreshNetwork = async () => {
    await network.refreshStatus()
    network = network
}

const cancelNetworkRefresh = () => {
    if ( interval ) clearInterval( interval )
}

onMount( async () => {
    refreshNetwork()
    interval = setInterval( refreshNetwork, frequency )

} )
</script>
<div data-tid="network-status" class="flex items-center gap-1">
    <div class="text-3xl">{network.name}</div>
    <input
        type="radio"
        class="radio"
        checked="checked"
        class:radio-error={!network.isAvailable()}
        class:radio-success={network.isAvailable()}
    />
</div>
