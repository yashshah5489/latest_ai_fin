import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-heading font-bold">Reports</h1>
          <p className="text-gray-400">Generate and view financial reports.</p>
          
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-dark-600 text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Financial Reporting</h3>
              <p className="text-gray-400 text-center max-w-md">
                Generate customized reports including income statements, expense breakdowns, and investment performance.
              </p>
              <p className="text-sm text-primary-400 mt-4">Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
