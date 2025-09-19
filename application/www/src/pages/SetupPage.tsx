import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { ProjectConfig } from "@/lib/api";

function SetupPage() {
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProject = async () => {
      try {
        const projectConfig: ProjectConfig = await api.getProject();

        // Check if project is already onboarded
        if (projectConfig.onboarded) {
          // Project is onboarded, redirect to editor
          window.location.href = "/editor";
        } else {
          // Project exists but not onboarded, show onboarding form
          setProjectName(projectConfig.name || "");
          setShowForm(true);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
          // No project exists, show setup page
          setIsLoading(false);
        } else {
          console.error("Error checking project:", error);
          // On error, show setup page as fallback
          setIsLoading(false);
        }
      }
    };

    checkProject();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.updateProject({
        onboarded: true,
        name: projectName.trim(),
      });

      // Redirect to editor page on success
      window.location.href = "/editor";
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark relative bg-black flex min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute left-0 top-0 inset-0 blur-3xl">
          <div className="h-screen w-screen">
            <video
              loop={true}
              src="/videos/swirl.mp4"
              preload="metadata"
              controlsList="nodownload"
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              muted
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {isLoading ? (
        <div className="relative z-10 flex flex-col gap-6 mx-auto text-center flex items-center justify-center">
          <img src="/images/logo.png" alt="Brew" className="w-40" />
          <p className="text-xl text-white font-medium">Loading...</p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-6 mx-auto text-center flex items-center justify-center">
          <img src="/images/logo.png" alt="Brew" className="w-40" />
          <p className="text-xl text-white font-medium">
            The product-centric approach to building apps with AI
          </p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-block bg-light hover:bg-active text-white px-4 py-2 rounded-full text-lg font-medium transition-colors cursor-pointer"
            >
              Get started
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full max-w-md"
            >
              <div className="text-left">
                <label
                  htmlFor="projectName"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-light text-white px-4 py-2 rounded-full border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your project name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !projectName.trim()}
                className="bg-light hover:bg-active text-white px-4 py-2 rounded-full text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Setting up..." : "Get Started"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default SetupPage;
