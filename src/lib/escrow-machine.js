import { assign, fromPromise } from "xstate";
import { findNetwork, setNetworkStatus } from "$lib/model/network.js";

export const gotEvent = ( { event } ) => {
    console.log( `got '${event.type}'`, event )
}
export const logState = ( name ) => () => {
    console.log( 'state :', name )
}
export const delay = ms =>
    new Promise( resolve => setTimeout( resolve, ms ) )

export const escrowMachine = {
    id: 'escrow_machine',
    initial: 'loading',

    context: {
        network: null,
        networkId: 'anvil',
        accounts: []
    },

    states: {

        error: {},

        loading: {
            entry: [ logState( 'loading' ) ],
            invoke: {
                input: ( { context } ) => ({
                    networkId: context.networkId,
                }),
                src: fromPromise( async ( { input } ) => {
                    // delay
                    // await delay( 3000 )
                    // accounts
                    const res = await fetch( `/api/accounts` )
                    const { data } = await res.json()
                    // network
                    const network = findNetwork( input.networkId )
                    await setNetworkStatus(network)
                    // init
                    return {
                        accounts: data,
                        network
                    };
                } ),
                onDone: {
                    target: 'running',
                    actions: [
                        gotEvent,
                        assign( {
                            accounts: ( { event } ) => event.output.accounts,
                            network: ( { event } ) => event.output.network,
                        } )
                    ]
                }
            },
        },

        running: {
            type: 'parallel',
            states: {
                ready: {
                    initial: 'idle',
                    states: {
                        idle: {}
                    }
                },
                network: {
                    initial: 'idle',
                    states: {
                        idle: {
                            entry: [ logState( 'network.idle' ) ],
                            after: { 2500: { target: 'refreshing' } }
                        },
                        refreshing: {
                            entry: [ logState( 'network.refreshing' ) ],
                            invoke: {
                                input: ( { context } ) => ({ network: context.network }),
                                src: fromPromise( async ( { input } ) => {
                                    const network = await setNetworkStatus( input.network )
                                    return { network }
                                } ),
                                onDone: {
                                    target: 'idle',
                                    actions: assign( { network: ( { event } ) => event.output.network } )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}