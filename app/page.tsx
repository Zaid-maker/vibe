import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Home</h1>
      <p className="mt-4 text-lg">This is a homepage</p>
      <Button>Click Me</Button>
    </div>
  );
};

export default Page;
