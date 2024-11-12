import { NextRequest, NextResponse } from 'next/server'
import 'dotenv/config'

const responseJson = {
  placeholder: "Hello World",
}
const responseJsonError = {
  placeholder: "Error hit",
}
const generateImage = async (prompt: string, seed: number) => {
  const url = 'https://api.together.xyz/v1/images/generations';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer ' + process.env.TOGETHER_API_KEY
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      //model: 'black-forest-labs/FLUX.1-schnell',
      steps: 2,
      n: 1,
      height: 1024,
      width: 1024,
      prompt: prompt, //'cats in geometric patterns on cavas',
      seed: seed,
      // negative_prompt: 'string'
    })
  };
  const response = await fetch(url, options);
  const responseArr = await response.json();
  console.log(responseArr);
  const dataArr = responseArr.data;
  //console.log( dataArr[0].url);
  return dataArr[0].url;
}
const generateImages = async (prompt: string, number = 1) => {
  //prompt: cats in geometric patterns on cavas
  const filesList = [];
  const filesObj = []; // {filename, dataURL}
  for (let i = 0; i < number; i++) {
    const imageUrl = await generateImage(prompt, i);
    
    /*
    // storee the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataURI = `data:image/png;base64,${base64Image}`;
    const dataUrl = dataURI;
    */

    // storee the URL to image
    const base64 = btoa(unescape(encodeURIComponent(imageUrl)));
    const dataUrl = `data:text/plain;base64,${base64}`;

    filesList.push(imageUrl);
    filesObj.push({
      filename: "file-" + i,
      dataURL: dataUrl,
    });
  }
  console.log(filesObj);
  return {filesList,filesObj};
}

const getOrders = async () => {
  const response = await fetch('https://open-api-fractal-testnet.unisat.io/v2/inscribe/order/summary', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      authorization: 'Bearer ' + process.env.FRACTAL_API_KEY
    },
  });
  const data = await response.json();
  console.log("fractal response", data);
  return data;
}
const createOrder = async (receiveAddress: string, files: []) => {
  const payload = {
    receiveAddress,
    feeRate: 1,
    outputValue: 546,
    files,
    devAddress: '3PxdVs8GQfPzqrYJ6ka1MmfUJ4i2K8tAwY',
    devFee: 1000,
  };
  console.log("fractal payload", payload);
  const response = await fetch('https://open-api-fractal-testnet.unisat.io/v2/inscribe/order/create', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      authorization: 'Bearer ' + process.env.FRACTAL_API_KEY
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  console.log("fractal response", data);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    console.log(body);
    // Generate images
    const {filesList, filesObj} = await generateImages(body.prompt, 1);
    const order = await createOrder(body.walletDest, filesObj);
    const payAddress = order?.data?.payAddress;
    const payAmount = order?.data?.amount;
    //const orderSummary=await getOrders();

    // Return JSON array of URLs
    const returnObj = {
      payAddress,
      payAmount,
      filesList,
    }
    return NextResponse.json(returnObj);
  } catch (error) {
    // If there's an error, return a 400 Bad Request response
    return NextResponse.json({ error }, { status: 400 })
  }
}

export async function GET() {
  try {
    // Return the response as JSON
    console.log('response', responseJson);
    return NextResponse.json(responseJson)
  } catch (error) {
    // If there's an error, return a 400 Bad Request response
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 })
  }
}