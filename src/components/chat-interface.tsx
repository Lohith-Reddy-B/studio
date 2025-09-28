'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, Send, Bot, User, CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitialResponse, getNextQuestion } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  author: 'user' | 'bot';
  content: React.ReactNode;
};

const LoadingIndicator = () => (
  <div className="flex items-center space-x-1">
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></span>
  </div>
);

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      author: 'bot',
      content: "Let's start by uploading an image. I'll tell you what I see!",
    },
  ]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [initialResponse, setInitialResponse] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const resetState = () => {
    setMessages([
        {
          id: 0,
          author: 'bot',
          content: "Something went wrong. Please upload another image to start over.",
        },
    ]);
    setUploadedImage(null);
    setImageDataUri(null);
    setIsLoading(false);
    setUserInput('');
    setInitialResponse('');
    setQuestions([]);
    setAnswers([]);
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an image file.",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedImage(objectUrl);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setImageDataUri(dataUri);

      setIsLoading(true);
      setMessages(prev => [...prev, { id: Date.now(), author: 'bot', content: <LoadingIndicator /> }]);
      
      const initialResponseResult = await getInitialResponse(dataUri);

      if (!initialResponseResult.success || !initialResponseResult.data) {
        toast({ variant: "destructive", title: "Image Analysis Failed", description: initialResponseResult.error });
        resetState();
        return;
      }

      const identification = initialResponseResult.data.identification;
      setInitialResponse(identification);
      
      setMessages(prev => prev.slice(0, -1).concat({ id: Date.now(), author: 'bot', content: identification }));
      setMessages(prev => [...prev, { id: Date.now() + 1, author: 'bot', content: <LoadingIndicator /> }]);

      const nextQuestionResult = await getNextQuestion({ photoDataUri: dataUri, initialResponse: identification });
      
      if (!nextQuestionResult.success || !nextQuestionResult.data) {
        toast({ variant: "destructive", title: "Question Generation Failed", description: nextQuestionResult.error });
        resetState();
        return;
      }
      
      const newQuestion = nextQuestionResult.data.newQuestion;
      setQuestions([newQuestion]);

      setMessages(prev => prev.slice(0, -1).concat({ id: Date.now(), author: 'bot', content: newQuestion }));
      setIsLoading(false);
      inputRef.current?.focus();
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({ variant: "destructive", title: "File Read Error", description: "There was an issue reading your file." });
      resetState();
    };
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading || !imageDataUri) return;

    const newUserMessage: Message = { id: Date.now(), author: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setAnswers(prev => [...prev, userInput]);
    const currentAnswer = userInput;
    setUserInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now() + 1, author: 'bot', content: <LoadingIndicator /> }]);

    const nextQuestionResult = await getNextQuestion({
      photoDataUri: imageDataUri,
      initialResponse: initialResponse,
      previousQuestions: questions,
      previousAnswers: [...answers, currentAnswer],
      newAnswer: currentAnswer
    });

    if (!nextQuestionResult.success || !nextQuestionResult.data) {
        toast({ variant: "destructive", title: "Conversation Error", description: nextQuestionResult.error });
        resetState();
        return;
    }

    const newQuestion = nextQuestionResult.data.newQuestion;
    setQuestions(prev => [...prev, newQuestion]);
    setMessages(prev => prev.slice(0, -1).concat({ id: Date.now(), author: 'bot', content: newQuestion }));
    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen p-4 sm:p-6 lg:p-8 gap-6 bg-background">
      <header className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">SeeItSayIt</h1>
      </header>
      <main className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Your Image</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {uploadedImage ? (
              <div className="relative w-full h-full aspect-video rounded-lg overflow-hidden shadow-inner border">
                <Image src={uploadedImage} alt="Uploaded by user" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-card/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                </div>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} disabled={isLoading} />
              </label>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex items-start gap-4", message.author === 'user' && "justify-end")}>
                    {message.author === 'bot' && (
                      <Avatar className="w-9 h-9 border">
                        <AvatarFallback className='bg-primary text-primary-foreground'><Bot className="w-5 h-5" /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[80%] rounded-lg px-4 py-3 text-sm shadow", message.author === 'bot' ? 'bg-card' : 'bg-primary text-primary-foreground')}>
                      {message.content}
                    </div>
                     {message.author === 'user' && (
                      <Avatar className="w-9 h-9 border">
                        <AvatarFallback className='bg-accent text-accent-foreground'><User className="w-5 h-5" /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 text-base"
                disabled={isLoading || !imageDataUri}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">Enter</span></kbd> to send.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
