import { findNetwork } from "$lib/model/network.js";
import { ethers } from "ethers";
import { networkId } from "$lib/config.js";

const createProvider = () => {
    const network = findNetwork( networkId )
    return new ethers.JsonRpcProvider( network.url )
}

export const provider = createProvider()

export const createBrowserProvider = () => {
    if ( typeof window === 'undefined' ) return false
    if ( typeof window.ethereum === 'undefined' ) return false
return new ethers.BrowserProvider( window.ethereum )
}