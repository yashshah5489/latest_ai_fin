import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import InvestmentsPage from "@/pages/investments-page";
import BudgetPage from "@/pages/budget-page";
import ReportsPage from "@/pages/reports-page";
import AIAdvisorPage from "@/pages/ai-advisor-page";
import RiskAnalysisPage from "@/pages/risk-analysis-page";
import ProfilePage from "@/pages/profile-page";
import DocumentsPage from "@/pages/documents-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/investments" component={InvestmentsPage} />
      <ProtectedRoute path="/budget" component={BudgetPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/ai-advisor" component={AIAdvisorPage} />
      <ProtectedRoute path="/documents" component={DocumentsPage} />
      <ProtectedRoute path="/risk-analysis" component={RiskAnalysisPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
