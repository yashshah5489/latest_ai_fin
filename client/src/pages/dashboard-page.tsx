import Sidebar from "@/components/layout/sidebar";
import SummaryCard from "@/components/dashboard/summary-card";
import AIAdvisor from "@/components/dashboard/ai-advisor";
import FinancialNews from "@/components/dashboard/financial-news";
import InvestmentOverview from "@/components/dashboard/investment-overview";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard');
      return res.json();
    }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          </div>
          
          <p className="text-gray-400">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ""}! Here's an overview of your financial status.
          </p>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Balance"
              amount={dashboardData?.totalBalance || 24765.00}
              percentChange={dashboardData?.balanceChange || 3.2}
              icon="account_balance_wallet"
              iconBgColor="bg-blue-500/20"
              iconColor="text-blue-500"
            />
            
            <SummaryCard
              title="Total Investments"
              amount={dashboardData?.totalInvestments || 12875.00}
              percentChange={dashboardData?.investmentsChange || 5.4}
              icon="trending_up"
              iconBgColor="bg-green-500/20"
              iconColor="text-green-500"
            />
            
            <SummaryCard
              title="Monthly Expenses"
              amount={dashboardData?.monthlyExpenses || 3450.00}
              percentChange={dashboardData?.expensesChange || 2.1}
              isNegative={true}
              icon="payments"
              iconBgColor="bg-orange-500/20"
              iconColor="text-orange-500"
            />
            
            <SummaryCard
              title="Portfolio Growth"
              amount={dashboardData?.portfolioGrowth || 8.7}
              percentChange={dashboardData?.growthChange || 1.3}
              isPercentage={true}
              icon="analytics"
              iconBgColor="bg-purple-500/20"
              iconColor="text-purple-500"
            />
          </div>
          
          {/* AI Advisor & News Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIAdvisor />
            <FinancialNews />
          </div>
          
          {/* Investment Overview */}
          <InvestmentOverview />
        </div>
      </main>
    </div>
  );
}
