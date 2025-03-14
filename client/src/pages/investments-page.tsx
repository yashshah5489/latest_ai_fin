import Sidebar from "@/components/layout/sidebar";
import PortfolioSummary from "@/components/investments/portfolio-summary";

export default function InvestmentsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-heading font-bold">Investments</h1>
          <p className="text-gray-400">Manage and track your investment portfolio.</p>
          
          <PortfolioSummary />
          
          {/* Asset Allocation */}
          <div className="bg-dark-700 rounded-lg shadow p-4 border border-dark-600">
            <h2 className="text-xl font-semibold text-white mb-4">Asset Allocation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative h-64 bg-dark-800 rounded-lg flex items-center justify-center">
                  {/* Chart would be implemented here */}
                  <div className="w-48 h-48 rounded-full border-8 border-primary-600 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-tr-full bg-green-500"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 rounded-br-full bg-amber-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-bl-full bg-purple-500"></div>
                    <div className="absolute top-0 left-0 w-24 h-24 rounded-tl-full bg-blue-500"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Total Value</p>
                      <p className="text-lg font-medium text-white">₹12,875.00</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">Equities (Domestic)</span>
                      </div>
                      <span className="text-sm text-white">40.7%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded">
                      <div className="h-2 bg-blue-500 rounded" style={{ width: '40.7%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">Fixed Income</span>
                      </div>
                      <span className="text-sm text-white">24.2%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded">
                      <div className="h-2 bg-green-500 rounded" style={{ width: '24.2%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">International Equities</span>
                      </div>
                      <span className="text-sm text-white">20.6%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded">
                      <div className="h-2 bg-purple-500 rounded" style={{ width: '20.6%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">Commodities</span>
                      </div>
                      <span className="text-sm text-white">14.5%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded">
                      <div className="h-2 bg-amber-500 rounded" style={{ width: '14.5%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-primary-400">AI Analysis:</span> Your portfolio is well diversified across asset classes, but slightly overweight in the financial sector (45% of equities). Consider rebalancing to reduce sector-specific risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
