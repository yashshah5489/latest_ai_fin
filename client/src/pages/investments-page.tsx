import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import PortfolioSummary from "@/components/investments/portfolio-summary";
import { fetchInvestments, Investment } from "@/api/investments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  UploadIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Colors for the pie chart
const COLORS = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#34495e', '#e67e22'];

type AssetAllocation = {
  name: string;
  value: number;
  color: string;
};

export default function InvestmentsPage() {
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const { 
    data: investments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/investments'],
    queryFn: fetchInvestments
  });

  useEffect(() => {
    if (investments) {
      // Calculate total value
      const total = investments.reduce((sum, inv) => sum + inv.value, 0);
      setTotalValue(total);

      // Group investments by type
      const allocationMap = new Map<string, number>();
      investments.forEach(inv => {
        const current = allocationMap.get(inv.type) || 0;
        allocationMap.set(inv.type, current + inv.value);
      });

      // Convert to array for chart
      const allocations: AssetAllocation[] = Array.from(allocationMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

      setAssetAllocation(allocations);
    }
  }, [investments]);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-2 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p>₹{data.value.toLocaleString('en-IN')}</p>
          <p>{((data.value / totalValue) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
            <p className="text-muted-foreground">Manage and track your investment portfolio.</p>
          </div>
          
          <PortfolioSummary />
          
          <Tabs defaultValue="allocation" className="w-full">
            <TabsList>
              <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="allocation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>
                    Distribution of your investments across different asset classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to load investment data. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {assetAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={renderCustomTooltip} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div>
                        <div className="space-y-4">
                          {assetAllocation.map((allocation, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: allocation.color }}
                                  ></div>
                                  <span className="text-sm">{allocation.name}</span>
                                </div>
                                <span className="text-sm">
                                  {((allocation.value / totalValue) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={(allocation.value / totalValue) * 100} 
                                className="h-2" 
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <Alert>
                            <AlertTitle className="flex items-center gap-2">
                              <span className="text-primary font-medium">AI Analysis</span>
                            </AlertTitle>
                            <AlertDescription className="text-sm">
                              Your portfolio is well diversified across asset classes, but slightly overweight 
                              in the financial sector. Consider rebalancing to reduce sector-specific risk.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>
                    Track the performance of your investments over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center py-12">
                    <p>Performance metrics coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="holdings" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Holdings</CardTitle>
                    <CardDescription>
                      List of all your investment holdings
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <UploadIcon className="h-4 w-4" />
                    Import Data
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to load investment data. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : investments && investments.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">Name</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Value</th>
                            <th className="px-4 py-3 text-right font-medium">Return</th>
                            <th className="px-4 py-3 text-right font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investments.map((investment: Investment) => (
                            <tr key={investment.id} className="border-b">
                              <td className="px-4 py-3">{investment.name}</td>
                              <td className="px-4 py-3">{investment.type}</td>
                              <td className="px-4 py-3">₹{investment.value.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center ${investment.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {investment.return >= 0 ? 
                                    <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                                  }
                                  {Math.abs(investment.return).toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-xs rounded-full px-2 py-1 font-medium
                                  ${investment.riskLevel === 'Low' ? 'bg-green-100 text-green-800' : 
                                    investment.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`
                                }>
                                  {investment.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">No investments found</p>
                      <Button size="sm" className="gap-2">
                        <UploadIcon className="h-4 w-4" />
                        Import Investment Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
