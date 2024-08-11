import { assign, fromPromise } from "xstate";
import { ethers } from "ethers";
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

    context: ( { input } ) => ({
        error: false,
        contractAddress: null,
        contract: {
            arbiter: "",
            beneficiary: "",
            amount: 0
        },
        networkId: input.networkId,
        network: null,
        contractAbi: input.contractAbi || null,
        contractBytecode: input.contractBytecode || null,
        accounts: []
    }),

    states: {


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
                    await setNetworkStatus( network )
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
                    initial: 'validating',
                    on: {
                        "set_contract": {
                            actions: [
                                gotEvent,
                                assign( {
                                    contract: ( { event } ) => {
                                        console.log( 'connnnnnnnnn', { event } )
                                        return { ...event.contract }
                                    }
                                } )
                            ],
                            target: 'ready.validating'
                        },
                    },
                    states: {

                        error: {
                            after: {
                                3000: {
                                    target: 'validating'
                                }
                            },
                            exit: assign( { error: false } )
                        },
                        validating: {
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
                                input: ( { context } ) => ({
                                    arbiter: context.contract.arbiter,
                                    beneficiary: context.contract.beneficiary,
                                    amount: context.contract.amount,
                                    abi: context.contractAbi,
                                    bytecode: context.contractBytecode,
                                }),
                                src: fromPromise( async ( { input } ) => {

                                    const {
                                        arbiter,
                                        beneficiary,
                                        amount,
                                        abi,
                                        bytecode,
                                    } = input

                                    const value = ethers.parseEther( amount ).toString()
                                    console.log( { arbiter, beneficiary, value } )

                                    const browserProvider = new ethers.BrowserProvider( window.ethereum )
                                    console.log( { browserProvider } )

                                    const signer = await browserProvider.getSigner()
                                    console.log( { signer } )

                                    const factory = new ethers.ContractFactory(
                                        abi,
                                        bytecode,
                                        signer
                                    )
                                    console.log( { factory } )

                                    const contract = await factory.deploy( arbiter, beneficiary, { value } )
                                    console.log( { contract } )

                                    const receipt = await contract.waitForDeployment()
                                    console.log( { contract, receipt } )

                                    const contractAddress = contract.target

                                    return { contractAddress }

                                } ),
                                onDone: {
                                    actions: [
                                        assign( { contractAddress: ( { event } ) => event.output.contractAddress } )
                                    ],
                                    target: 'deployed',
                                },
                                onError: {
                                    target: 'error',
                                    actions: [
                                        err => console.log( 'errr', { err } ),
                                        assign( { error: ( { event } ) => event.error.shortMessage } ),
                                    ],
                                }
                            }

                        },
                        deployed: {
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
                                input: ( { context } ) => ({
                                    arbiter: context.contract.arbiter,
                                    abi: context.contractAbi,
                                    contractAddress: context.contractAddress
                                }),
                                src: fromPromise( async ( { input } ) => {

                                    const {
                                        arbiter,
                                        abi,
                                        contractAddress,
                                    } = input


                                    const browserProvider = new ethers.BrowserProvider( window.ethereum )
                                    console.log( 'approve', { browserProvider } )

                                    const signer = await browserProvider.getSigner()
                                    console.log( 'approve', { signer } )

                                    const contract = new ethers.Contract(
                                        contractAddress,
                                        abi,
                                        signer
                                    )
                                    console.log( 'approve', { contract } )

                                    const tx = await contract.approve()
                                    const receipt = await tx.wait()

                                    // update
                                    const res = await fetch( `/api/accounts` )
                                    const json = await res.json()
                                    const accounts = json.data
                                    console.log( 'approve', { accounts } )

                                    return { accounts }

                                } ),
                                onDone: {
                                    actions: [
                                        assign( { accounts: ( { event } ) => event.output.accounts } )
                                    ],
                                    target: 'approved',
                                },
                                onError: {
                                    target: 'error',
                                    actions: [
                                        err => console.log( 'errr', { err } ),
                                        assign( { error: ( { event } ) => event.error.shortMessage } ),
                                    ],
                                }
                            }

                        },
                        approved: {}
                    }
                },
                network: {
                    initial: 'idle',
                    states: {
                        idle: {
                            entry: [
                                // logState( 'network.idle' )
                            ],
                            after: { 2500: { target: 'refreshing' } }
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