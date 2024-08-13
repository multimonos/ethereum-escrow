<script>
// list accounts and their balances
import Ether from "./data/Ether.svelte";
import Address from "./data/Address.svelte";

export let deployments = []

</script>
<table class="table table-sm font-mono">
    <thead>
        <tr>
            <th>Address</th>
            <th>Balance</th>
            <th>Owner</th>
            <th class="text-center">Approved</th>
        </tr>
    </thead>
    <tbody>
        {#each deployments as deployment,i}
            <tr>
                <td>
                    <Address address={deployment.address}/>
                </td>
                <td>
                    <Ether wei={deployment.balance} colorize={true}/>
                </td>
                <td>
                    <Address address={deployment.owner}/>
                </td>
                <td class="text-center">
                    {#if deployment.approved}
                        <span class="badge badge-xs badge-success"></span>
                    {:else}
                        <span class="badge badge-xs badge-error"></span>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>