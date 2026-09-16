import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ScrollManager } from "./components/layout/ScrollManager";
import { I18nProvider } from "./i18n/I18nProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import EvaluationPage from "./pages/EvaluationPage";
import LearnPage from "./pages/LearnPage";
import NotFoundPage from "./pages/NotFoundPage";
import OverviewPage from "./pages/OverviewPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import RetrievalPage from "./pages/RetrievalPage";
import VectorStorePage from "./pages/VectorStorePage";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <ScrollManager />
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route
                path="documents/:documentId"
                element={<DocumentDetailPage />}
              />
              <Route path="playground" element={<PlaygroundPage />} />
              <Route path="retrieval" element={<RetrievalPage />} />
              <Route path="vector-store" element={<VectorStorePage />} />
              <Route path="evaluation" element={<EvaluationPage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
