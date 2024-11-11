import { NextRequest, NextResponse } from 'next/server'
import 'dotenv/config'

const responseJson = {
  placeholder: "Hello World",
}
const responseJsonError = {
  placeholder: "Error hit",
}

const generateImages = async (prompt:string, number=4) => {
  const url = 'https://api.together.xyz/v1/images/generations';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer '+ process.env.TOGETHER_API_KEY
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
  const result = await fetch(url, options);
  const json = result.json();
  return json;
}


export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    if (body.key==="secretKey") {
      // Generate images
      const arr = await generateImages(body.prompt, body.num);
      
      // Return JSON array of URLs
      console.log('response',responseJson);
      return NextResponse.json(responseJson);
    }
    else {
      return NextResponse.json(responseJsonError)
    }
  } catch (error) {
    // If there's an error, return a 400 Bad Request response
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 })
  }
}

export async function GET() {
  try {
    // Return the response as JSON
    console.log('response',responseJson);
    return NextResponse.json(responseJson)
  } catch (error) {
    // If there's an error, return a 400 Bad Request response
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 })
  }
}