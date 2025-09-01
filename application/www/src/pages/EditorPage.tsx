import { useEffect } from "react";
import Tiptap from "../Tiptap";
import Navbar from "../Navbar";
import { api } from "@/lib/api";

function EditorPage() {
  useEffect(() => {
    // Verify project is onboarded when entering editor
    const verifyProject = async () => {
      try {
        const projectConfig = await api.getProject();
        if (!projectConfig.onboarded) {
          // Redirect back to setup if not onboarded
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error verifying project:", error);
        // Redirect to setup on error
        window.location.href = "/";
      }
    };

    verifyProject();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <div className="sticky left-0 top-0 h-full z-10">
        <Navbar />
      </div>
      <div className="flex-1 px-8 py-12 mx-auto w-full max-w-6xl">
        <Tiptap />
      </div>
    </div>
  );
}

export default EditorPage;
