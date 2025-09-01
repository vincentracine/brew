import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { api } from "@/lib/api";
import type { Feature } from "@/lib/api";
import FeatureEditor from "../components/FeatureEditor";

function FeaturePage() {
  const { featureId } = useParams<{ featureId: string }>();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeature = async () => {
      if (!featureId) {
        setError("Feature ID not provided");
        setLoading(false);
        return;
      }

      try {
        const loadedFeature = await api.getFeature(featureId);
        setFeature(loadedFeature);
      } catch (err) {
        console.error("Error loading feature:", err);
        setError("Failed to load feature");
      } finally {
        setLoading(false);
      }
    };

    loadFeature();
  }, [featureId]);

  const handleFeatureUpdate = (updatedFeature: Feature) => {
    setFeature(updatedFeature);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="sticky left-0 top-0 h-full z-10">
          <Navbar />
        </div>
        <div className="flex-1 px-8 py-12 mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading feature...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="flex h-screen bg-white">
        <div className="sticky left-0 top-0 h-full z-10">
          <Navbar />
        </div>
        <div className="flex-1 px-8 py-12 mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-center h-full">
            <p className="text-red-600">{error || "Feature not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="sticky left-0 top-0 h-full z-10">
        <Navbar />
      </div>
      <div className="flex-1 px-8 py-12 w-full">
        <FeatureEditor feature={feature} onUpdate={handleFeatureUpdate} />
      </div>
    </div>
  );
}

export default FeaturePage;
