import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ThemeProvider } from "./theme/ThemeProvider";
import DocumentsPage from "./pages/DocumentsPage";
import EvaluationPage from "./pages/EvaluationPage";
import LearnPage from "./pages/LearnPage";
import NotFoundPage from "./pages/NotFoundPage";
import OverviewPage from "./pages/OverviewPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import RetrievalPage from "./pages/RetrievalPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="retrieval" element={<RetrievalPage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
