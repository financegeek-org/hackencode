import { NextRequest, NextResponse } from 'next/server'
import 'dotenv/config'

const responseJson = {
  placeholder: "Hello World",
}
const responseJsonError = {
  placeholder: "Error hit",
}

const generateImages = async (prompt: string, number = 4) => {
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
      steps: 2,
      n: number,
      height: 512,
      width: 512,
      prompt: prompt, //'cats in geometric patterns on cavas',
      seed: 2,
      // negative_prompt: 'string'
    })
  };
  const response = await fetch(url, options);
  const responseArr = await response.json();
  console.log(responseArr);
  const dataArr = responseArr.data;
  const files = [];
  dataArr.array.forEach(element => {
    files.push(element.url);
  });
  console.log(files);
  return files;

}

const createOrder = async (receiveAddress: string, files) => {
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
  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    console.log(body);
    // Generate images
    const filesArr = await generateImages(body.prompt, 2);
    const order = await createOrder(body.walletDest, filesArr);

    // Return JSON array of URLs
    console.log('response', responseJson);
    return NextResponse.json(responseJson);
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