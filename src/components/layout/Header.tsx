import { BarChart3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'StockSense - AI Stock Analysis',
        text: 'Check out this AI-powered stock analysis tool!',
        url: window.location.href,
      }).catch(() => {
        // Fallback to copying URL
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    });
  };

  return (
    <header className="border-b border-border bg-background-secondary/50 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">StockSense</h1>
              <p className="text-sm text-foreground-muted">AI Stock Analysis Assistant</p>
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-border text-foreground hover:bg-background-tertiary"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </header>
  );
};