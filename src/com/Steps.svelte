<script>
export let state
$:progress = JSON.stringify( state.running.ready ).toLowerCase().replaceAll( /[^a-z]+/g, '' )

$:isValid = [ 'valid', 'deployed', 'deploying', 'approved', 'approving' ].includes( progress )
$:isDeployed= [  'deployed',  'approved', 'approving' ].includes( progress )
$:isApproved= [    'approved'  ].includes( progress )
</script>
<ul class="steps text-xs w-full">
    <li data-content="" class="step step-neutral">Begin</li>
    <li data-content="" class="step" class:step-neutral={isValid}>Valid</li>
    <li data-content="" class="step" class:step-neutral={isDeployed}>Deployed</li>
    <li data-content="" class="step" class:step-neutral={isApproved}>Approved</li>
</ul>