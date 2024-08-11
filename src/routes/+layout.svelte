<script>
import "../app.css";
import NetworkStatus from "../com/NetworkStatus.svelte";
import { networkId } from "$lib/config.js";
</script>

<div class="container mx-auto">
    <div class="mx-4 my-8">

        <header class="mb-8 flex items-end gap-x-4 justify-between">
            <div class="flex flex-col">
                <h2 class="text-xs uppercase">Alchemy Ethereum Bootcamp</h2>
                <h1 class="text-3xl">Escrow Contract</h1>
            </div>

            <div>
                <NetworkStatus id={networkId} frequency={15000}/>
            </div>
        </header>

        <slot/>

    </div>
</div>
