import { NextRequest, NextResponse } from 'next/server'
import 'dotenv/config'
import { Account, GlittrSDK, txBuilder } from "@glittr-sdk/sdk";

const NETWORK = "regtest";

const client = new GlittrSDK({
  network: NETWORK,
  electrumApi: "https://hackathon-electrum.glittr.fi",
  glittrApi: "https://hackathon-core-api.glittr.fi",
});
const account = new Account({
  wif: process.env.BTC_PRIVATE_WIF,
  network: NETWORK,
});

const glittrCreate = async (filesList) => {
  //console.log("Glittr account", account.p2pkh());
  const result = [];
  filesList.forEach(async file => {
    const c = txBuilder.freeMintContractInstantiate({
      simple_asset: {
        supply_cap: 2000n.toString(),
        divisibility: 18,
        live_time: 0,
      },
      amount_per_mint: 2n.toString(),
    });
  
    const txid = await client.createAndBroadcastTx({
      account: account.p2pkh(),
      tx: c,
      outputs: []
    });
    console.log("TXID : ", txid);
    result.push(txid);    
  });
  console.log("Glittr results", account);
  return result;
}

export async function GET() {
  try {
    const trans = await glittrCreate([1]); 
    console.log('response', trans);
    return NextResponse.json(trans)
  } catch (error) {
    // If there's an error, return a 400 Bad Request response
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 })
  }
}