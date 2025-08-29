import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  analysis?: StockAnalysis;
}

interface StockAnalysis {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe: number;
  recommendations: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
}

// Mock data for demonstration
const mockAnalysis = (symbol: string): StockAnalysis => ({
  symbol: symbol.toUpperCase(),
  price: Math.random() * 500 + 50,
  change: (Math.random() - 0.5) * 20,
  changePercent: (Math.random() - 0.5) * 10,
  volume: (Math.random() * 10000000).toLocaleString(),
  marketCap: `$${(Math.random() * 500 + 50).toFixed(1)}B`,
  pe: Math.random() * 30 + 5,
  recommendations: [
    "Strong fundamentals with consistent revenue growth",
    "Recent market volatility presents buying opportunity",
    "Consider position sizing based on current portfolio allocation"
  ],
  sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
  riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
});

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm StockSense, your AI stock analysis assistant. What stock would you like me to analyze today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput("");
    setIsTyping(true);

    try {
      // Call n8n webhook with user query
      const response = await fetch(`https://totally-eternal-shrew.ngrok-free.app/webhook/a0ea8e36-8d95-453d-a776-6dbc9ce49b03?query=${encodeURIComponent(userQuery)}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to get analysis from AI agent`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if response is HTML (ngrok warning page)
      if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        throw new Error('Received HTML instead of JSON - ngrok tunnel may be blocking the request');
      }

      let analysisData;
      try {
        analysisData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from webhook');
      }
      
      // Parse the n8n response and create AI message
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: analysisData.message || "Here's my analysis:",
        timestamp: new Date(),
        analysis: analysisData.analysis ? {
          symbol: analysisData.analysis.symbol || 'N/A',
          price: analysisData.analysis.price || 0,
          change: analysisData.analysis.change || 0,
          changePercent: analysisData.analysis.changePercent || 0,
          volume: analysisData.analysis.volume || 'N/A',
          marketCap: analysisData.analysis.marketCap || 'N/A',
          pe: analysisData.analysis.pe || 0,
          recommendations: analysisData.analysis.recommendations || [],
          sentiment: analysisData.analysis.sentiment || 'neutral',
          riskLevel: analysisData.analysis.riskLevel || 'medium'
        } : undefined
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      
      // Show error message to user
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting to my analysis engine right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            <div
              className={cn(
                "flex",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <Card
                className={cn(
                  "max-w-[70%] p-4 border-border",
                  message.type === 'user'
                    ? "bg-chat-user text-white"
                    : "bg-chat-ai text-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>

            {/* Analysis Display */}
            {message.analysis && (
              <div className="space-y-4">
                <StockAnalysisCard analysis={message.analysis} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <Card className="bg-chat-ai text-foreground p-4 border-border">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-foreground-muted">Analyzing...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to analyze a stock (e.g., 'Analyze AAPL' or 'What do you think about TSLA?')"
            className="flex-1 bg-chat-input border-border text-foreground placeholder:text-foreground-muted"
          />
          <Button
            onClick={handleSend}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const StockAnalysisCard = ({ analysis }: { analysis: StockAnalysis }) => {
  const isPositive = analysis.change >= 0;
  const sentimentColor = analysis.sentiment === 'bullish' ? 'text-financial-positive' : 
                        analysis.sentiment === 'bearish' ? 'text-financial-negative' : 
                        'text-financial-neutral';

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">{analysis.symbol}</h3>
        </div>
        <div className={cn("flex items-center space-x-1", sentimentColor)}>
          {analysis.sentiment === 'bullish' ? <TrendingUp className="w-4 h-4" /> : 
           analysis.sentiment === 'bearish' ? <TrendingDown className="w-4 h-4" /> : 
           <BarChart3 className="w-4 h-4" />}
          <span className="text-sm font-medium capitalize">{analysis.sentiment}</span>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Current Price</p>
          <p className="text-lg font-bold text-foreground">${analysis.price.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Change</p>
          <p className={cn("text-lg font-bold", isPositive ? "text-financial-positive" : "text-financial-negative")}>
            {isPositive ? '+' : ''}${analysis.change.toFixed(2)} ({isPositive ? '+' : ''}{analysis.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Volume</p>
          <p className="text-lg font-bold text-foreground">{analysis.volume}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Market Cap</p>
          <p className="text-lg font-bold text-foreground">{analysis.marketCap}</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">P/E Ratio</p>
          <p className="text-lg font-bold text-foreground">{analysis.pe.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Risk Level</p>
          <p className={cn("text-lg font-bold capitalize", 
            analysis.riskLevel === 'low' ? 'text-financial-positive' : 
            analysis.riskLevel === 'high' ? 'text-financial-negative' : 
            'text-financial-neutral')}
          >
            {analysis.riskLevel}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-foreground">AI Recommendations</h4>
        <div className="space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p className="text-sm text-foreground-muted leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};