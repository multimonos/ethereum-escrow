<script>
import { ethers } from "ethers";

export let wei
export let colorize = false

const formatter = new Intl.NumberFormat( 'en-CA', { minimumFractionDigits: 4 } )

$:ether = formatter.format(
    ethers.formatUnits( wei, 'ether' )
)
</script>
<div class="flex items-center gap-x-1 {
     colorize && parseInt(wei) > 0 ? 'text-success'
     : colorize && parseInt(wei) <= 0 ? 'text-error'
     : ''
     }">
    <span class="text-base-content icon-[token--eth]"></span>
    <span>{ ether }</span>
</div>
