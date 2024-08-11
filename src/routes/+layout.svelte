<script>
import "../app.css";
import NetworkStatus from "../com/NetworkStatus.svelte";
import { networkId } from "$lib/config.js";
</script>

<div class="container mx-auto">
    <div class="mx-4 my-8">



        <slot/>

    </div>
</div>
