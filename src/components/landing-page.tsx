'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles } from 'lucide-react';

export function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/chat');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center p-8 max-w-lg w-full bg-card rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full animate-pulse">
            <div className="p-5 bg-primary/20 rounded-full">
               <Camera className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-headline flex items-center justify-center gap-2">
          <span>Hey Hi,</span>
          <Sparkles className="h-8 w-8 text-accent" />
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-headline">Are you Ready?</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Welcome to <span className="font-semibold text-primary">SeeItSayIt</span>. Let an AI tell you about your world, one picture at a time.
        </p>
        <Button onClick={handleStart} size="lg" className="w-full sm:w-auto font-semibold text-lg py-7 px-12 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
          Let's Start
        </Button>
      </div>
    </div>
  );
}
