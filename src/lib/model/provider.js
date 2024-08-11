import { findNetwork } from "$lib/model/network.js";
import { ethers } from "ethers";
import { networkId } from "$lib/config.js";

const createProvider = () => {
    const network = findNetwork( networkId )
    return new ethers.JsonRpcProvider( network.url )
}

export const provider = createProvider()