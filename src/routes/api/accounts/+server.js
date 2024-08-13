import { json } from "@sveltejs/kit";
import { getAccounts } from "$lib/model/account.js";
import { createNetworkProvider } from "$lib/model/provider.js";


export async function GET() {
    const provider = createNetworkProvider()
    const data = await getAccounts( provider )
    return json( { data } )
}