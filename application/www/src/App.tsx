import { Routes, Route } from "react-router-dom";
import EditorPage from "@/pages/EditorPage";
import SetupPage from "@/pages/SetupPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
