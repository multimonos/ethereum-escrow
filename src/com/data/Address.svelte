<script>
export let address
$:copied = false

const copy = data => async event => {
    try {
        await navigator.clipboard.writeText( data )
        copied = true
        setTimeout( () => copied = false, 300 )
    } catch ( err ) {
        console.log( err )
    }
}
</script>
<div class="flex items-center gap-x-0.5">
    <span class="font-mono">{address.replace( /^(.{6}).+(.{4})$/, '$1...$2' )}</span>
    <button class="btn btn-xs btn-ghost" on:click={copy(address)}>
        <span class="icon-[solar--copy-line-duotone]"></span>
    </button>
</div>
