<script>
import { ethers } from "ethers";

export let wei
const formatter = new Intl.NumberFormat( 'en-CA', { minimumFractionDigits: 4 } )
$:ether = formatter.format(
    ethers.formatUnits( wei, 'ether' )
)
</script>

<div class="flex items-center">
    <span>{ ether }</span>
    <span class="icon-[token--eth]"></span>
</div>
