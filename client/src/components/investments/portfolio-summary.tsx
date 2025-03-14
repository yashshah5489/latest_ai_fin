import { useQuery } from "@tanstack/react-query";
import { fetchPortfolioSummary } from "@/api/investments";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon } from "lucide-react";

export default function PortfolioSummary() {
  // Fetch portfolio summary data using our API function
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/investments/summary'],
    queryFn: fetchPortfolioSummary
  });

  // Format currency with INR symbol
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Portfolio Value</h3>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : error ? (
            <p className="text-sm text-destructive">Failed to load data</p>
          ) : (
            <>
              <p className="text-2xl font-semibold">
                {formatCurrency(data?.portfolioValue || 0)}
              </p>
              <div className={`flex items-center ${data && data.valueChange >= 0 ? 'text-green-500' : 'text-destructive'} mt-1`}>
                {data && data.valueChange >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {data ? `${data.valueChange > 0 ? '+' : ''}${data.valueChange.toFixed(1)}%` : '0%'} this month
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Annual Return</h3>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : error ? (
            <p className="text-sm text-destructive">Failed to load data</p>
          ) : (
            <>
              <p className="text-2xl font-semibold">
                {data ? `${data.annualReturn.toFixed(1)}%` : '0%'}
              </p>
              <div className={`flex items-center ${data && data.benchmarkDiff >= 0 ? 'text-green-500' : 'text-destructive'} mt-1`}>
                {data && data.benchmarkDiff >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {data ? `${data.benchmarkDiff > 0 ? '+' : ''}${data.benchmarkDiff.toFixed(1)}%` : '0%'} vs benchmark
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Dividend Income</h3>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-2/4 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ) : error ? (
            <p className="text-sm text-destructive">Failed to load data</p>
          ) : (
            <>
              <p className="text-2xl font-semibold">
                {formatCurrency(data?.dividendIncome || 0)}
              </p>
              <div className="flex items-center text-muted-foreground mt-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Last payment: {data ? formatDate(data.lastPaymentDate) : 'N/A'}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
