<script>
export let options
export let title = 'Select ...'
export let selected
</script>

<select class="select select-sm" on:change>
    <option selected={selected}>{title}</option>

    {#each options as option}
        <option
            value={option.value}
            selected={selected==option.value}
        >{option.label}</option>
    {/each}
</select>