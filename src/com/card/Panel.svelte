<script>
export let title
export let style = "default"
let badgeClasses = "badge-ghost"
$ : {
    if ( style === "success" ) badgeClasses = "badge-success"
    if ( style === "error" ) badgeClasses = "badge-error"
    if ( style === "warning" ) badgeClasses = "badge-warning"
}
</script>
<div class="indicator w-full">
    <div class="indicator-item indicator-center badge {badgeClasses} text-xs uppercase">
        {@html title}
    </div>
    <div class="grid border rounded w-full pt-4">
        <slot/>
    </div>
</div>