import { assign, fromPromise, raise } from "xstate";
import { findNetwork, setNetworkStatus } from "$lib/model/network.js";
import { deploy, deployInput } from "$lib/machine/deploy.js";
import { approve, approveInput } from "$lib/machine/approve.js";
import { createBrowserProvider } from "$lib/model/provider.js";

const createToast = ( { type = "info", message = "" } = {} ) => ({
    type,
    message,
    "expiresAt": performance.now() + 5000
})

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

    context: ( { input } ) => ({
        error: false,
        networkId: input.networkId,
        contractAddress: null,
        contractBalance: null,
        contract: {
            arbiter: "",
            beneficiary: "",
            amount: 0
        },
        depositorIndex: 0,
        network: null,
        contractAbi: input.contractAbi || null,
        contractBytecode: input.contractBytecode || null,
        accounts: [],
        provider: null,
        toasts: [],
    }),

    states: {


        loading: {
            entry: [ logState( 'loading' ) ],
            invoke: {
                input: ( { context } ) => ({
                    networkId: context.networkId,
                    depositorIndex: context.depositorIndex,
                }),
                src: fromPromise( async ( { input } ) => {
                    const {
                        depositorIndex,
                        networkId,
                    } = input

                    // provider
                    const provider = createBrowserProvider()

                    // accounts
                    const res = await fetch( `/api/accounts` )
                    const json = await res.json()
                    const accounts = json.data
                    accounts[depositorIndex].role = 'depositor'

                    // network
                    const network = findNetwork( networkId )
                    await setNetworkStatus( network )
                    // init
                    return {
                        accounts,
                        network,
                        provider,
                    };
                } ),
                onDone: {
                    target: 'running',
                    actions: [
                        gotEvent,
                        assign( {
                            accounts: ( { event } ) => event.output.accounts,
                            network: ( { event } ) => event.output.network,
                            provider: ( { event } ) => event.output.provider,
                        } )
                    ]
                }
            },
        },

        running: {
            type: 'parallel',
            states: {

                toasts: {
                    initial: 'idle',
                    states: {
                        idle: {
                            // entry: [ logState( 'toasts.idle' ) ],
                            always: {
                                target: 'clearing',
                                guard: ( { context } ) => context.toasts.length > 0
                            }
                        },
                        clearing: {
                            entry: [
                                // logState( 'toasts.clearing' ),
                                assign( {
                                    toasts: ( { context } ) => {
                                        const mark = performance.now()
                                        const toasts = context.toasts.filter( t => t.expiresAt > mark )
                                        return toasts
                                    }
                                } )
                            ],
                            after: {
                                300: {
                                    target: 'idle'
                                }
                            }
                        }
                    },
                    on: {
                        toast: {
                            actions: assign( {
                                toasts: ( { context, event } ) => {
                                    return [ ...context.toasts, createToast( { ...event.toast } ) ]
                                }
                            } )
                        }
                    }
                },

                error: {
                    initial: 'idle',
                    states: {
                        idle: {
                            always: {
                                target: 'error',
                                guards: ( { context } ) => context.error
                            }
                        },
                        error: {
                            after: {
                                7500: {
                                    target: 'idle',
                                    actions: assign( { error: null } )
                                }
                            }
                        }
                    }
                },

                ready: {
                    initial: 'validating',
                    on: {
                        set_contract: {
                            actions: [
                                gotEvent,
                                assign( {
                                    contract: ( { event } ) => {
                                        const createContract = ( { arbiter = "", beneficiary = "", amount = 0 } = {} ) => ({
                                            arbiter,
                                            beneficiary,
                                            amount: parseFloat( amount ),
                                        })
                                        console.log( event.contract )
                                        return createContract( { ...event.contract } )
                                    },
                                    accounts: ( { event, context } ) => {
                                        const { accounts } = context
                                        const { contract } = event
                                        console.log( 'accounts', { accounts, contract } )
                                        const naccounts = accounts.map( ( acc, i ) => {
                                            if ( contract.arbiter && contract.arbiter === acc.address ) {
                                                acc.role = 'arbiter'
                                            } else if ( contract.beneficiary && contract.beneficiary === acc.address ) {
                                                acc.role = 'beneficiary'
                                            } else if ( i === context.depositorIndex ) {
                                                acc.role = 'depositor'
                                            } else {
                                                acc.role = ""
                                            }
                                            return acc
                                        } )

                                        return accounts
                                    }
                                } )
                            ],
                            target: 'ready.validating'
                        },

                    },
                    states: {
                        validating: {
                            entry: [ logState( 'validating' ) ],
                            always: {
                                guard: ( { context } ) => {
                                    return context.contract.arbiter !== ''
                                        && context.contract.beneficiary !== ''
                                        && context.contract.amount > 0
                                },
                                target: 'valid',
                            }
                        },
                        valid: {
                            on: {
                                deploy: {
                                    actions: () => console.log( 'deploy' ),
                                    target: 'deploying',
                                }
                            }
                        },
                        deploying: {
                            invoke: {
                                input: deployInput,
                                src: fromPromise( deploy ),
                                onDone: {
                                    actions: [
                                        assign( { contractAddress: ( { event } ) => event.output.contractAddress } ),
                                        raise( { type: 'toast', toast: { message: 'Deployed', type: 'success' } } )
                                    ],
                                    target: 'deployed',
                                },
                                onError: {
                                    target: 'validating',
                                    actions: [
                                        err => console.error( 'deploying', { err } ),
                                        assign( { error: ( { event } ) => event.error.message } ),
                                    ],
                                }
                            }

                        },
                        deployed: {
                            entry: [
                                logState( 'deployed' ),
                            ],
                            on: {
                                approve: {
                                    actions: [
                                        () => console.log( 'approved' ),
                                    ],
                                    target: 'approving'
                                }
                            }
                        },
                        approving: {
                            invoke: {
                                input: approveInput,
                                src: fromPromise( approve ),
                                onDone: {
                                    actions: [
                                        assign( { accounts: ( { event } ) => event.output.accounts } ),
                                        raise( { type: 'toast', toast: { message: 'Approved', type: 'success' } } )
                                    ],
                                    target: 'approved',
                                },
                                onError: {
                                    target: 'deployed',
                                    actions: [
                                        err => console.error( 'approving', { err } ),
                                        assign( { error: ( { event } ) => event.error.message } ),
                                    ],
                                }
                            }
                        },
                        approved: {
                            entry: [
                                logState( 'approved' ),
                            ],
                        }
                    }
                },
                network: {
                    initial: 'idle',
                    states: {
                        idle: {
                            entry: [
                                // logState( 'network.idle' )
                            ],
                            after: { 30000: { target: 'refreshing' } }
                        },
                        refreshing: {
                            entry: [
                                // logState( 'network.refreshing' )
                            ],
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