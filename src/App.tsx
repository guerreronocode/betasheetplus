import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TransactionsHistory from "./pages/TransactionsHistory";
import StyleGuide from "./pages/StyleGuide";
import FinancialAnalysis from "./pages/FinancialAnalysis";
import MonthlyBalance from "./pages/MonthlyBalance";
import GoalsDashboard from "./pages/GoalsDashboard";
import InvestmentDashboard from "./pages/InvestmentDashboard";
import BankAccountsPage from "./pages/BankAccountsPage";
import CreditCards from "./pages/CreditCards";
import Lancamentos from "./pages/Lancamentos";
import LancamentosPendencias from "./pages/LancamentosPendencias";
import LancamentosSimple from "./pages/LancamentosSimple";
import InvestmentsPage from "./pages/InvestmentsPage";
import DebtsPage from "./pages/DebtsPage";
import PatrimonyPage from "./pages/PatrimonyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/transactions-history" element={
                <ProtectedRoute>
                  <TransactionsHistory />
                </ProtectedRoute>
              } />
              <Route path="/financial-analysis" element={
                <ProtectedRoute>
                  <FinancialAnalysis />
                </ProtectedRoute>
              } />
              <Route path="/monthly-balance" element={
                <ProtectedRoute>
                  <MonthlyBalance />
                </ProtectedRoute>
              } />
              <Route path="/goals-dashboard" element={
                <ProtectedRoute>
                  <GoalsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/investment-dashboard" element={
                <ProtectedRoute>
                  <InvestmentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/bank-accounts" element={
                <ProtectedRoute>
                  <BankAccountsPage />
                </ProtectedRoute>
              } />
              <Route path="/credit-cards/*" element={
                <ProtectedRoute>
                  <CreditCards />
                </ProtectedRoute>
              } />
              <Route path="/lancamentos-simple" element={
                <ProtectedRoute>
                  <LancamentosSimple />
                </ProtectedRoute>
              } />
              <Route path="/lancamentos" element={
                <ProtectedRoute>
                  <Lancamentos />
                </ProtectedRoute>
              } />
              <Route path="/lancamentos/pendencias" element={
                <ProtectedRoute>
                  <LancamentosPendencias />
                </ProtectedRoute>
              } />
              <Route path="/investments" element={
                <ProtectedRoute>
                  <InvestmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/debts" element={
                <ProtectedRoute>
                  <DebtsPage />
                </ProtectedRoute>
              } />
              <Route path="/patrimonio" element={
                <ProtectedRoute>
                  <PatrimonyPage />
                </ProtectedRoute>
              } />
              <Route path="/style-guide" element={<StyleGuide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
