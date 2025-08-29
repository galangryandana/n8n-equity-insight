import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)]">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default Index;
