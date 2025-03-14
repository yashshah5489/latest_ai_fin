import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Get color based on risk score
  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
            <p className="text-muted-foreground">Assess your risk profile and get investment recommendations.</p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Personalized Analysis</AlertTitle>
            <AlertDescription>
              This tool analyzes your risk tolerance based on your financial situation and 
              provides personalized asset allocation recommendations suitable for the Indian market.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Your Risk Profile
                </CardTitle>
                <CardDescription>
                  Adjust the parameters to match your financial situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="age" className="text-sm font-medium">Age: {riskData.age}</Label>
                    <span className="text-xs text-muted-foreground">Years</span>
                  </div>
                  <Slider
                    id="age"
                    min={18}
                    max={80}
                    step={1}
                    value={[riskData.age]}
                    onValueChange={(value) => handleSliderChange('age', value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="investmentHorizon" className="text-sm font-medium">Investment Horizon: {riskData.investmentHorizon}</Label>
                    <span className="text-xs text-muted-foreground">Years</span>
                  </div>
                  <Slider
                    id="investmentHorizon"
                    min={1}
                    max={30}
                    step={1}
                    value={[riskData.investmentHorizon]}
                    onValueChange={(value) => handleSliderChange('investmentHorizon', value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="riskTolerance" className="text-sm font-medium">Risk Tolerance: {riskData.riskTolerance}%</Label>
                    <span className="text-xs text-muted-foreground">Low → High</span>
                  </div>
                  <Slider
                    id="riskTolerance"
                    min={0}
                    max={100}
                    step={5}
                    value={[riskData.riskTolerance]}
                    onValueChange={(value) => handleSliderChange('riskTolerance', value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="emergencyFund" className="text-sm font-medium">Emergency Fund: {riskData.emergencyFund}</Label>
                    <span className="text-xs text-muted-foreground">Months of expenses</span>
                  </div>
                  <Slider
                    id="emergencyFund"
                    min={0}
                    max={24}
                    step={1}
                    value={[riskData.emergencyFund]}
                    onValueChange={(value) => handleSliderChange('emergencyFund', value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="incomeStability" className="text-sm font-medium">Income Stability: {riskData.incomeStability}%</Label>
                    <span className="text-xs text-muted-foreground">Unstable → Stable</span>
                  </div>
                  <Slider
                    id="incomeStability"
                    min={0}
                    max={100}
                    step={5}
                    value={[riskData.incomeStability]}
                    onValueChange={(value) => handleSliderChange('incomeStability', value)}
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
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Your personalized risk assessment and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskAnalysisMutation.isError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to analyze risk profile. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
                
                {result ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk Score</h3>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" 
                          style={{ width: '100%' }}
                        ></div>
                        <div 
                          className="absolute top-0 h-6 w-1 bg-foreground" 
                          style={{ left: `${result.riskScore}%`, transform: 'translateX(-50%) translateY(-25%)' }}
                        ></div>
                      </div>
                      <p className="text-3xl font-bold">{result.riskScore}/100</p>
                      <p className="text-primary font-medium">{result.riskCategory} Risk Profile</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Recommended Asset Allocation</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Equities</span>
                            <span>{result.assetAllocation.equities}%</span>
                          </div>
                          <Progress value={result.assetAllocation.equities} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fixed Income</span>
                            <span>{result.assetAllocation.fixedIncome}%</span>
                          </div>
                          <Progress value={result.assetAllocation.fixedIncome} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Gold</span>
                            <span>{result.assetAllocation.gold}%</span>
                          </div>
                          <Progress value={result.assetAllocation.gold} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cash</span>
                            <span>{result.assetAllocation.cash}%</span>
                          </div>
                          <Progress value={result.assetAllocation.cash} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Recommendations</h3>
                      <ul className="space-y-2 text-sm">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2 shrink-0">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-primary mb-4">
                      <Shield className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Analysis Yet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      Adjust the sliders to match your financial situation and click "Analyze Risk Profile" 
                      to see your personalized recommendations.
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
