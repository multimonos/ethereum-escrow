<script>
export let options
export let title
export let selected
</script>

<label class="form-control w-full">
    <select class="select select-bordered" on:change>
        <option  selected={selected}>Select ...</option>

        {#each options as option}
            <option
                value={option.value}
                selected={selected==option.value}
            >{option.label}</option>
        {/each}
    </select>

    <div class="label">
        <span class="label-text-alt">{title}</span>
    </div>

</label>