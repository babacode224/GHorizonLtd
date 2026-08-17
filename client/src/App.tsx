import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AboutPage, ContactPage, FAQPage, ServicesPage } from "./pages/ContentPages";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { ListingsPage } from "./pages/ListingsPage";
import SubmissionPage from "./pages/SubmissionPage";
import AdminPage from "./pages/AdminPage";
import CarSalesPage from "./pages/CarSalesPage";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/properties" component={() => <ListingsPage kind="property" />} /><Route path="/properties/:slug" component={() => <ListingDetailPage kind="property" />} /><Route path="/cars" component={CarSalesPage} /><Route path="/cars/:slug" component={() => <ListingDetailPage kind="vehicle" />} /><Route path="/about" component={AboutPage} /><Route path="/services" component={ServicesPage} /><Route path="/faq" component={FAQPage} /><Route path="/contact" component={ContactPage} /><Route path="/submit" component={SubmissionPage} /><Route path="/admin" component={AdminPage} /><Route path="/admin/upload" component={AdminPage} /><Route component={Home} /></Switch>; }

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
