import { Routes, Route } from "react-router-dom";
import SetupPage from "@/pages/SetupPage";
import { FeaturePage } from "./pages/FeaturePage";
import { FeaturesPage } from "./pages/FeaturesPage";
import "./App.css";
import { SidebarLayout } from "./layouts/SidebarLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route element={<SidebarLayout />}>
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/features/:featureId" element={<FeaturePage />} />
      </Route>
    </Routes>
  );
}

export default App;
