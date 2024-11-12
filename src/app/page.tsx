"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function Component() {
  const [prompt, setPrompt] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [consoleOutput, setConsoleOutput] = useState("Results from generation will be here")
  const [payAddress, setPayAddress] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [imageList, setImageList] = useState([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/imagegen';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        walletDest: walletAddress,
      })
    };
    const result = await fetch(url, options);
    const resultJson = await result.json();

    console.log("Submitted:", { prompt, walletAddress })
    console.log("Client Response:", { resultJson })
    // Handle form submission logic here
    setPayAddress(resultJson.payAddress);
    setPayAmount(resultJson.payAmount);
    setImageList(resultJson.filesList);

  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="w-full max-w-md mx-auto bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Fractal NFT Generator</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium text-gray-300">
                  Prompt
                </Label>
                <Input
                  id="prompt"
                  placeholder="Enter your prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-sm font-medium text-gray-300">
                  Wallet Address
                </Label>
                <Input
                  id="wallet"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
              >
                Generate
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="w-4/5 mx-auto">
          <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {consoleOutput || "Console output will appear here..."}
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {imageList.map((imageUrl, index) => (
            <div key={index} className="relative w-full pt-[100%]">
              <Image
                src={imageUrl}
                alt={`Generated Image ${index + 1}`}
                layout="fill"
                objectFit="contain"
                className="absolute top-0 left-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}