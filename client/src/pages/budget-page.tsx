import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-heading font-bold">Budget</h1>
          <p className="text-gray-400">Manage your monthly expenses and income.</p>
          
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-dark-600 text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Budget Planning</h3>
              <p className="text-gray-400 text-center max-w-md">
                Track your income and expenses, create budgets, and see where your money is going.
              </p>
              <p className="text-sm text-primary-400 mt-4">Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
