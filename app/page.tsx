"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Send, CheckCircle, XCircle } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const [inputText, setInputText] = useState("Hello World from Inngest");
  const [message, setMessage] = useState("");

  const invoke = useMutation({
    ...trpc.invoke.mutationOptions({}),
    onSuccess: () => {
      setMessage("Background job invoked successfully!");
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      invoke.mutate({ text: inputText.trim() });
    }
  };

  const clearMessage = () => setMessage("");

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Background Job Invoker
          </CardTitle>
          <CardDescription>
            Trigger background jobs with custom messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-input">Message</Label>
              <Input
                id="message-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your message..."
                disabled={invoke.isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={invoke.isPending || !inputText.trim()}
              className="flex items-center gap-2 w-full"
            >
              {invoke.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {invoke.isPending ? "Invoking..." : "Invoke Background Job"}
            </Button>
          </form>

          {message && (
            <Alert className={invoke.isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <div className="flex items-center gap-2">
                {invoke.isError ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={invoke.isError ? "text-red-700" : "text-green-700"}>
                  {message}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessage}
                  className="ml-auto h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;