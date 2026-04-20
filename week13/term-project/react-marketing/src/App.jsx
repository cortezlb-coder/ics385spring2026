import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import MarketingPage from "./components/MarketingPage";

const fallbackProperty = {
  name: "Maui Surf House",
  island: "Maui",
  type: "vacation rental",
  description: "A surf-friendly vacation stay in Kihei for Australians visiting Maui.",
  amenities: ["Surfboard storage", "Outdoor shower", "Jeep or Tacoma rental"],
  targetSegment: "Australian surfers",
  imageURL:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  reviews: []
};

export default function App() {
  const [property, setProperty] = useState(fallbackProperty);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadProperty() {
      try {
        const response = await fetch("http://localhost:3000/properties?format=json");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const properties = await response.json();

        if (isMounted && Array.isArray(properties) && properties.length > 0) {
          setProperty(properties[0]);
          setLoadState("loaded");
        } else if (isMounted) {
          setProperty(fallbackProperty);
          setLoadState("fallback");
        }
      } catch (error) {
        if (isMounted) {
          setProperty(fallbackProperty);
          setLoadState("fallback");
        }
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <MarketingPage property={property} loadState={loadState} />
      <Dashboard property={property} />
    </main>
  );
}
