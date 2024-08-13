import { findNetwork } from "$lib/model/network.js";
import { ethers } from "ethers";
import { networkId } from "$lib/config.js";

export const createNetworkProvider = () => {
    const network = findNetwork( networkId )
    return new ethers.JsonRpcProvider( network.url )
}

export const createBrowserProvider = () => {
    if ( typeof window === 'undefined' ) return false
    if ( typeof window.ethereum === 'undefined' ) return false
    return new ethers.BrowserProvider( window.ethereum )
}