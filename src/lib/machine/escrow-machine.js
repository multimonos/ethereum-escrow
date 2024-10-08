import { assign, fromPromise, raise } from "xstate";
import { setNetworkStatus } from "$lib/model/network.js";
import { deploy, deployInput } from "$lib/machine/deploy.js";
import { approve, approveInput } from "$lib/machine/approve.js";
import { createContract, createDeployment, createToast } from "$lib/machine/machine-models.js";
import { gotEvent, logError, logState } from "$lib/machine/actions.js";
import { createRefreshInput, refresh } from "$lib/machine/refresh.js";
import { setRoleFromContract } from "$lib/model/account.js";
import { createPrepareInput, prepare } from "$lib/machine/prepare.js";

export const Messages = {
    ContractApproved: 'Approved',
    ContractDeployed: 'Deployed',
}

export const escrowMachine = {

    id: 'escrow_machine',

    initial: 'preparing',

    context: ( { input } ) => ({
        dbg: input.dbg || false,
        error: false,
        networkId: input.networkId,
        contractAddress: null,
        contract: {
            depositor: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            arbiter: "",
            beneficiary: "",
            amount: 0
        },
        network: null,
        contractAbi: input.contractAbi || null,
        contractBytecode: input.contractBytecode || null,
        accounts: [],
        toasts: [],
        deployments: []
    }),

    states: {

        preparing: {
            entry: logState( 'preparing' ),
            invoke: {
                input: createPrepareInput,
                src: fromPromise( prepare ),
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
                toasts: {
                    initial: 'idle',
                    states: {
                        idle: {
                            always: {
                                target: 'clearing',
                                guard: ( { context } ) => context.toasts.length > 0
                            }
                        },
                        clearing: {
                            entry: [
                                assign( {
                                    toasts: ( { context } ) => context.toasts.filter( t => t.expiresAt > performance.now() )
                                } )
                            ],
                            after: { 300: { target: 'idle' } }
                        }
                    },
                    on: {
                        toast: {
                            actions: assign( {
                                toasts: ( { context, event } ) => [ ...context.toasts, createToast( { ...event.toast } ) ]
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
                                    contract: ( { event } ) => createContract( { ...event.contract } ),
                                    accounts: ( { event, context } ) => {
                                        const { accounts } = context
                                        const contract = createContract( { ...event.contract } )
                                        return accounts.map( account => setRoleFromContract( account, contract ) )
                                    }
                                } )
                            ],
                            target: 'ready.validating'
                        },

                    },
                    states: {
                        validating: {
                            always: {
                                guard: ( { context } ) => {
                                    return context.contract.depositor !== ''
                                        && context.contract.arbiter !== ''
                                        && context.contract.beneficiary !== ''
                                        && context.contract.amount > 0
                                },
                                target: 'valid',
                            }
                        },
                        valid: {
                            on: {
                                deploy: {
                                    actions: gotEvent,
                                    target: 'deploying',
                                }
                            }
                        },
                        deploying: {
                            entry: logState( 'deploying' ),
                            invoke: {
                                input: deployInput,
                                src: fromPromise( deploy ),
                                onDone: {
                                    target: 'deployed',
                                    actions: [
                                        assign( {
                                            contractAddress: ( { event } ) => event.output.contractAddress,
                                            deployments: ( { context, event } ) =>
                                                [ ...context.deployments, createDeployment( { ...event.output.deployment } ) ]
                                        } ),
                                        raise( { type: 'toast', toast: { message: Messages.ContractDeployed, type: 'success' } } )
                                    ],
                                },
                                onError: {
                                    target: 'validating',
                                    actions: [
                                        logError( 'deploying' ),
                                        assign( { error: ( { event } ) => event.error.message } ),
                                    ],
                                }
                            }
                        },
                        deployed: {
                            entry: logState( 'deployed' ),
                            on: { approve: { actions: gotEvent, target: 'approving' } }
                        },
                        approving: {
                            entry: logState( 'approving' ),
                            invoke: {
                                input: approveInput,
                                src: fromPromise( approve ),
                                onDone: {
                                    target: 'approved',
                                    actions: [
                                        // assign( { accounts: ( { event } ) => event.output.accounts } ),
                                        raise( { type: 'toast', toast: { message: Messages.ContractApproved, type: 'success' } } )
                                    ],
                                },
                                onError: {
                                    target: 'deployed',
                                    actions: [
                                        logError( 'approving' ),
                                        assign( { error: ( { event } ) => event.error.message } ),
                                    ],
                                }
                            }
                        },
                        approved: {
                            entry: logState( 'approved' ),
                            invoke: {
                                input: createRefreshInput,
                                src: fromPromise( refresh ),
                                onDone: {
                                    actions: [
                                        gotEvent,
                                        assign( {
                                            accounts: ( { event } ) => event.output.accounts,
                                            deployments: ( { event } ) => event.output.deployments,
                                        } )
                                    ]
                                }
                            }
                        }
                    }
                },


                network: {
                    initial: 'idle',
                    states: {
                        idle: {
                            after: { 30000: { target: 'refreshing' } }
                        },
                        refreshing: {
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