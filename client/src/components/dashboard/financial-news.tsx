import { useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

export default function FinancialNews() {
  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/news');
      return res.json();
    }
  });

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <Card className="bg-dark-700 border-dark-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Newspaper className="mr-2 h-5 w-5 text-primary-500" />
          Financial News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-800 pb-3">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-3 w-16 mr-2" />
                  <span className="mx-2 text-gray-700">•</span>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Failed to load news. Please try again later.</p>
          </div>
        ) : news && news.length > 0 ? (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="border-b border-gray-800 pb-3">
                <h3 className="font-medium text-white">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">{getRelativeTime(item.publishedAt)}</span>
                  <span className="mx-2 text-gray-700">•</span>
                  <span className="text-xs text-primary-400">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No financial news available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 justify-center">
        <Button 
          variant="link" 
          className="text-primary-400 hover:text-primary-300"
        >
          View All News
        </Button>
      </CardFooter>
    </Card>
  );
}
