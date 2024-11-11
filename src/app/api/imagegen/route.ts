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
      //model: 'black-forest-labs/FLUX.1-schnell-Free',
      model: 'black-forest-labs/FLUX.1-schnell',
      steps: 2,
      n: 1,
      height: 512,
      width: 512,
      prompt: prompt, //'cats in geometric patterns on cavas',
      seed: seed,
      // negative_prompt: 'string'
    })
  };
  const response = await fetch(url, options);
  const responseArr = await response.json();
  //console.log(responseArr);
  const dataArr = responseArr.data;
  //console.log( dataArr[0].url);
  return dataArr[0].url;
}
const generateImages = async (prompt: string, number = 2) => {
  //prompt: cats in geometric patterns on cavas
  const filesList = [];
  const filesObj = []; // {filename, dataURL}
  for (let i = 0; i < number; i++) {
    const imageUrl = await generateImage(prompt, i);
    filesList.push(imageUrl);
    filesObj.push({
      filename: i,
      dataUrl: imageUrl,
    });
  }
  console.log(filesObj);
  return filesObj;
}

const createOrder = async (receiveAddress: string, files: []) => {
  const payload = {
    receiveAddress,
    feeRate: 1,
    outputValue: 546,
    files,
    devAddress: '2NFWqZc4J27uM3eAqmtBsyiejWQvCA3JMkW',
    devFee: 1000,
  };
  const response = await fetch('https://open-api-fractal.unisat.io/v2/inscribe/order/create', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  console.log(data);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    console.log(body);
    // Generate images
    const filesObj = await generateImages(body.prompt, 2);
    const order = await createOrder(body.walletDest, filesObj);

    // Return JSON array of URLs
    console.log('response', order);
    return NextResponse.json(order);
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