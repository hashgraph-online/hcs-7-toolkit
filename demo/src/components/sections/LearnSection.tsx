import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LearnSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Understanding HCS-7</CardTitle>
        <CardDescription>Learn how HCS-7 enables dynamic NFTs through smart contract state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <section>
            <h3 className="text-2xl font-semibold mb-4">What is HCS-7?</h3>
            <p className="text-gray-600 dark:text-gray-300">
              HCS-7 is a standard that allows you to create NFTs whose metadata updates based on smart contract state.
              It combines on-chain data with WASM processing for trustless, programmatic updates.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Dynamic metadata updates based on smart contract state</li>
              <li>WASM-powered processing for complex conditions</li>
              <li>Trustless and verifiable execution</li>
              <li>Compatible with existing NFT standards</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>NFT Minting Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  Update NFT appearance based on total minted supply
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Price-Based Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  Dynamic NFTs that change based on token prices
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
