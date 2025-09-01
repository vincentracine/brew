import { Routes, Route } from "react-router-dom";
import EditorPage from "@/pages/EditorPage";
import SetupPage from "@/pages/SetupPage";
import FeaturePage from "./pages/FeaturePage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/features/:featureId" element={<FeaturePage />} />
    </Routes>
  );
}

export default App;
