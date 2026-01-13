import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import TimeTracking from "./pages/TimeTracking";
import Notes from "./pages/Notes";
import Secrets from "./pages/Secrets";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      {/* Dashboard routes with sidebar layout */}
      <Route path="/" component={() => <DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/clients" component={() => <DashboardLayout><Clients /></DashboardLayout>} />
      <Route path="/projects" component={() => <DashboardLayout><Projects /></DashboardLayout>} />
      <Route path="/tasks" component={() => <DashboardLayout><Tasks /></DashboardLayout>} />
      <Route path="/documents" component={() => <DashboardLayout><Documents /></DashboardLayout>} />
      <Route path="/calendar" component={() => <DashboardLayout><Calendar /></DashboardLayout>} />
      <Route path="/time-tracking" component={() => <DashboardLayout><TimeTracking /></DashboardLayout>} />
      <Route path="/notes" component={() => <DashboardLayout><Notes /></DashboardLayout>} />
      <Route path="/secrets" component={() => <DashboardLayout><Secrets /></DashboardLayout>} />
      <Route path="/settings" component={() => <DashboardLayout><Settings /></DashboardLayout>} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
