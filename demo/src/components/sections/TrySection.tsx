import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TrySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Try HCS-7 on KiloScribe</CardTitle>
        <CardDescription>Experience HCS-7 through our LaunchPages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            KiloScribe offers a user-friendly interface to interact with HCS-7 LaunchPages.
            Create your first dynamic NFT without any coding required.
          </p>
          
          <div className="flex justify-center">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => window.open('https://kiloscribe.xyz/launch-pages', '_blank')}
            >
              Launch KiloScribe
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
