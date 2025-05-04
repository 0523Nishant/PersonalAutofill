import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAutofillHistory, clearAutofillHistory } from "@/lib/storage";
import { AutofillHistoryItem } from "@/lib/types";

const HistorySection = () => {
  const [history, setHistory] = useState<AutofillHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load history when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await getAutofillHistory();
        setHistory(savedHistory || []);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast({
          title: "Error",
          description: "Failed to load your autofill history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [toast]);

  // Handle clear history
  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your autofill history?")) {
      try {
        await clearAutofillHistory();
        setHistory([]);
        toast({
          title: "History Cleared",
          description: "Your autofill history has been cleared.",
        });
      } catch (error) {
        console.error("Failed to clear history:", error);
        toast({
          title: "Error",
          description: "Failed to clear your history.",
          variant: "destructive",
        });
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // If more than a week ago, show the date
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) {
        return `${daysDiff} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  // Get badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return "success";
      case 'partial':
        return "warning";
      case 'error':
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading history...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex justify-between items-center">
        <CardTitle>Autofill History</CardTitle>
        <Button 
          variant="ghost" 
          onClick={handleClearHistory}
          disabled={history.length === 0}
          className="h-8 px-2 text-xs"
        >
          Clear History
        </Button>
      </CardHeader>
      
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-1">
            {history.map((item, index) => (
              <div key={index}>
                <div className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">{item.domain}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                    </div>
                    <Badge variant={getBadgeVariant(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {item.message || `${item.filledCount} fields filled successfully.`}
                    </p>
                  </div>
                </div>
                {index < history.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No autofill history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistorySection;
