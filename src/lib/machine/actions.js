export const gotEvent = ( { context, event } ) => {
    context.dbg && console.log( `got '${event.type}'`, event )
}
export const logState = ( name ) => ( { context } ) => {
    context.dbg && console.log( 'state :', name )
}
export const logError = label => error =>
    console.log( 'error :', label, { error } )
export const delay = ms =>
    new Promise( resolve => setTimeout( resolve, ms ) )