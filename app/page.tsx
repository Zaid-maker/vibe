"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="space-y-4">
        <Button 
          onClick={() => invoke.mutate({ text: "Hello World from Inngest" })}
          disabled={invoke.isPending}
          className="flex items-center gap-2"
        >
          {invoke.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {invoke.isPending ? "Invoking..." : "Invoke Background Job"}
        </Button>
        
        {message && (
          <div className={`p-3 rounded-md ${
            invoke.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;