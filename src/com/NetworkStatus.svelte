<script>
export let network
</script>
<div data-tid="network-status" data-network-status={network.status} class="flex items-center gap-1">
    <div class="text-3xl">{network.name}</div>
    <input
        type="radio"
        class="radio"
        checked="checked"
        class:radio-error={!network.available}
        class:radio-success={network.available}
    />
</div>
