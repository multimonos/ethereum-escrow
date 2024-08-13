<script>
import { slide } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export let toasts = []
</script>
<div class="toast toast-center toast-top z-50 min-w-64">
    {#each toasts as toast }
        <div out:slide={{ duration:400, axis:'y',easing:cubicOut}}
             class:alert-info={toast.type==='info'}
             class:alert-error={toast.type==='error'}
             class:alert-success={toast.type==='success'}
             class:text-white={['error','success','info'].includes(toast.type)}
             class:alert-warning={toast.type==='warning'}
             class="alert">
            <span> {toast.message} </span>
        </div>
    {/each}
</div>
