<script>
// list accounts and their balances
import Panel from "./card/Panel.svelte";
import Ether from "./data/Ether.svelte";
//props
export let accounts = []
</script>

<Panel title="accounts">
    <table class="table table-sm font-mono mt-2">
        <thead>
            <tr>
                <th></th>
                <th>Balance</th>
                <th>Address</th>
            </tr>
        </thead>
        <tbody>
            {#each accounts as account,i}
                <tr data-address={account.address}>
                    <td>{i}</td>
                    <td>
                        <Ether wei={account.balance}/>
                    </td>
                    <td>{account.address}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</Panel>