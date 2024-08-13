<script>
import { onMount } from "svelte";


//@todo solve if the user disables wallet mid-session

//wallet
$:hasWallet = false

const refresh = () => {
    hasWallet = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}
onMount( async () => {
    refresh()
} )
</script>
<div class="flex justify-between items-center gap-x-2 text-xs">
    <span>Wallet</span>
    {#if hasWallet}
        <span class="text-lg text-success icon-[solar--check-square-linear]"></span>
    {:else}
        <span class="text-lg text-error icon-[solar--danger-square-linear]"></span>
    {/if}
</div>
