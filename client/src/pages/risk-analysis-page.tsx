import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RiskProfileData {
  age: number;
  investmentHorizon: number;
  riskTolerance: number;
  emergencyFund: number;
  incomeStability: number;
}

interface RiskAnalysisResult {
  riskScore: number;
  riskCategory: string;
  assetAllocation: {
    equities: number;
    fixedIncome: number;
    gold: number;
    cash: number;
  };
  recommendations: string[];
}

export default function RiskAnalysisPage() {
  const { toast } = useToast();
  const [riskData, setRiskData] = useState<RiskProfileData>({
    age: 35,
    investmentHorizon: 10,
    riskTolerance: 50,
    emergencyFund: 6,
    incomeStability: 70
  });
  const [result, setResult] = useState<RiskAnalysisResult | null>(null);

  const riskAnalysisMutation = useMutation({
    mutationFn: async (data: RiskProfileData) => {
      const res = await apiRequest('POST', '/api/risk-analysis', data);
      return res.json();
    },
    onSuccess: (data: RiskAnalysisResult) => {
      setResult(data);
      toast({
        title: "Risk Analysis Complete",
        description: `Your risk profile is: ${data.riskCategory}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSliderChange = (name: keyof RiskProfileData, value: number[]) => {
    setRiskData(prev => ({
      ...prev,
      [name]: value[0]
    }));
  };

  const handleAnalyze = () => {
    riskAnalysisMutation.mutate(riskData);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-heading font-bold">Risk Analysis</h1>
          <p className="text-gray-400">Assess your risk profile and get investment recommendations.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-dark-700 border-dark-600">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary-500" />
                  Your Risk Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="age">Age: {riskData.age}</Label>
                    <span className="text-sm text-gray-400">Years</span>
                  </div>
                  <Slider
                    id="age"
                    min={18}
                    max={80}
                    step={1}
                    value={[riskData.age]}
                    onValueChange={(value) => handleSliderChange('age', value)}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="investmentHorizon">Investment Horizon: {riskData.investmentHorizon}</Label>
                    <span className="text-sm text-gray-400">Years</span>
                  </div>
                  <Slider
                    id="investmentHorizon"
                    min={1}
                    max={30}
                    step={1}
                    value={[riskData.investmentHorizon]}
                    onValueChange={(value) => handleSliderChange('investmentHorizon', value)}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="riskTolerance">Risk Tolerance: {riskData.riskTolerance}%</Label>
                    <span className="text-sm text-gray-400">Low → High</span>
                  </div>
                  <Slider
                    id="riskTolerance"
                    min={0}
                    max={100}
                    step={5}
                    value={[riskData.riskTolerance]}
                    onValueChange={(value) => handleSliderChange('riskTolerance', value)}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="emergencyFund">Emergency Fund: {riskData.emergencyFund}</Label>
                    <span className="text-sm text-gray-400">Months of expenses</span>
                  </div>
                  <Slider
                    id="emergencyFund"
                    min={0}
                    max={24}
                    step={1}
                    value={[riskData.emergencyFund]}
                    onValueChange={(value) => handleSliderChange('emergencyFund', value)}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="incomeStability">Income Stability: {riskData.incomeStability}%</Label>
                    <span className="text-sm text-gray-400">Unstable → Stable</span>
                  </div>
                  <Slider
                    id="incomeStability"
                    min={0}
                    max={100}
                    step={5}
                    value={[riskData.incomeStability]}
                    onValueChange={(value) => handleSliderChange('incomeStability', value)}
                    className="cursor-pointer"
                  />
                </div>
                
                <Button 
                  onClick={handleAnalyze} 
                  className="w-full mt-4"
                  disabled={riskAnalysisMutation.isPending}
                >
                  {riskAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Risk Profile"
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-700 border-dark-600">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-dark-800 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Risk Score</h3>
                      <div className="relative h-4 bg-dark-600 rounded-full overflow-hidden mb-2">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                          style={{ width: `${result.riskScore}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 h-full w-1 bg-white" 
                          style={{ left: `${result.riskScore}%`, transform: 'translateX(-50%)' }}
                        ></div>
                      </div>
                      <p className="text-2xl font-bold text-white">{result.riskScore}/100</p>
                      <p className="text-primary-400 font-medium">{result.riskCategory} Risk Profile</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Recommended Asset Allocation</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Equities</span>
                            <span>{result.assetAllocation.equities}%</span>
                          </div>
                          <div className="h-2 bg-dark-800 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${result.assetAllocation.equities}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fixed Income</span>
                            <span>{result.assetAllocation.fixedIncome}%</span>
                          </div>
                          <div className="h-2 bg-dark-800 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${result.assetAllocation.fixedIncome}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Gold</span>
                            <span>{result.assetAllocation.gold}%</span>
                          </div>
                          <div className="h-2 bg-dark-800 rounded-full">
                            <div 
                              className="h-2 bg-yellow-500 rounded-full" 
                              style={{ width: `${result.assetAllocation.gold}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cash</span>
                            <span>{result.assetAllocation.cash}%</span>
                          </div>
                          <div className="h-2 bg-dark-800 rounded-full">
                            <div 
                              className="h-2 bg-gray-500 rounded-full" 
                              style={{ width: `${result.assetAllocation.cash}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            <span className="text-gray-300 text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center text-primary-500 mb-4">
                      <Shield className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Analysis Yet</h3>
                    <p className="text-gray-400 text-center">
                      Adjust the sliders to match your financial situation and click "Analyze Risk Profile" to see your personalized recommendations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
