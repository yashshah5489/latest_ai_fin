import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  allocation: number;
  return: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

export default function InvestmentOverview() {
  const { data: investments, isLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investments');
      return res.json();
    }
  });

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/20 text-green-500';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'High':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getIconBgClass = (type: string) => {
    switch (type) {
      case 'Equities':
        return 'bg-blue-500/20 text-blue-500';
      case 'Fixed Income':
        return 'bg-green-500/20 text-green-500';
      case 'Foreign Equities':
        return 'bg-purple-500/20 text-purple-500';
      case 'Commodities':
        return 'bg-amber-500/20 text-amber-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  // Format currency with INR symbol
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card className="bg-dark-700 border-dark-600">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary-500" />
            Investment Overview
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="text-sm font-medium text-primary-400 hover:text-primary-300 bg-primary-400/10 border-none"
          >
            <Download className="h-4 w-4 mr-1" />
            Import Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Allocation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Return</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                Array(4).fill(0).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <Skeleton className="h-3 w-8 mb-1" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  </tr>
                ))
              ) : investments && investments.length > 0 ? (
                investments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`${getIconBgClass(investment.type)} p-2 rounded-full mr-3`}>
                          <span className="material-icons text-sm">{investment.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{investment.name}</div>
                          <div className="text-xs text-gray-400">{investment.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(investment.value)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-32">
                        <div className="text-xs text-gray-300 mb-1">{investment.allocation.toFixed(1)}%</div>
                        <div className="h-1.5 bg-dark-600 rounded">
                          <div 
                            className="h-1.5 bg-primary-600 rounded" 
                            style={{ width: `${investment.allocation}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <span className={investment.return >= 0 ? "text-green-500" : "text-red-500"}>
                        {investment.return >= 0 ? "+" : ""}{investment.return.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(investment.riskLevel)}`}>
                        {investment.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No investment data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
