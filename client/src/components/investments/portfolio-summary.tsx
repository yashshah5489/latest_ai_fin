import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioSummaryData {
  portfolioValue: number;
  valueChange: number;
  annualReturn: number;
  benchmarkDiff: number;
  dividendIncome: number;
  lastPaymentDate: string;
}

export default function PortfolioSummary() {
  const { data, isLoading } = useQuery<PortfolioSummaryData>({
    queryKey: ['/api/investments/summary'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investments/summary');
      return res.json();
    }
  });

  // Format currency with INR symbol
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
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
      <Card className="bg-dark-700 border-dark-600 p-4">
        <h2 className="text-lg font-medium text-white mb-2">Portfolio Value</h2>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-white">
              {formatCurrency(data?.portfolioValue || 12875.00)}
            </p>
            <div className="flex items-center text-green-500 mt-1">
              <span className="material-icons text-sm">arrow_upward</span>
              <span className="text-sm">
                {formatCurrency(data?.valueChange || 1245.00)} (5.4%) this month
              </span>
            </div>
          </>
        )}
      </Card>
      
      <Card className="bg-dark-700 border-dark-600 p-4">
        <h2 className="text-lg font-medium text-white mb-2">Annual Return</h2>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-white">
              {(data?.annualReturn || 14.2).toFixed(1)}%
            </p>
            <div className="flex items-center text-green-500 mt-1">
              <span className="material-icons text-sm">arrow_upward</span>
              <span className="text-sm">
                {(data?.benchmarkDiff || 2.3).toFixed(1)}% higher than benchmark
              </span>
            </div>
          </>
        )}
      </Card>
      
      <Card className="bg-dark-700 border-dark-600 p-4">
        <h2 className="text-lg font-medium text-white mb-2">Dividend Income</h2>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-2/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-white">
              {formatCurrency(data?.dividendIncome || 450.00)}
            </p>
            <div className="flex items-center text-gray-400 mt-1">
              <span className="material-icons text-sm">calendar_today</span>
              <span className="text-sm">
                Last payment: {formatDate(data?.lastPaymentDate || '2023-05-15')}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
