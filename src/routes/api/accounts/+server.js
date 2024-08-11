import { json } from "@sveltejs/kit";
import { getAccounts } from "$lib/model/account.js";
import { provider } from "$lib/model/provider.js";


export async function GET() {
    const data = await getAccounts( provider )
    return json( { data } )
}