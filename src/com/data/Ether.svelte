<script>
import { ethers } from "ethers";

export let wei
const formatter = new Intl.NumberFormat( 'en-CA', { minimumFractionDigits: 4 } )
$:ether = formatter.format(
    ethers.formatUnits( wei, 'ether' )
)
</script>

<div class="flex items-center gap-x-1">
    <span class="text-base-content icon-[token--eth]"></span>
    <span >{ ether }</span>
</div>
