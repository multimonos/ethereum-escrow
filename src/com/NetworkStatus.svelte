<script>
export let network
</script>
<div class="flex justify-between items-center gap-x-2 text-xs">
    <span>{network.name}</span>
    {#if network.available}
        <span class="text-lg text-success icon-[solar--check-square-linear]"></span>
    {:else}
        <span class="text-lg text-error icon-[solar--danger-square-linear]"></span>
    {/if}
</div>
