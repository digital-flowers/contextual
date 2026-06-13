import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Feature } from "@contextual/types";
import { Button } from "../../components/ui/Button";
import { FeatureCard } from "./FeatureCard";

interface FeaturesScreenProps {
  features: Feature[];
}

export function FeaturesScreen({ features }: FeaturesScreenProps) {
  const active = features.filter((f) => f.status !== "archived");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text">Features</h1>
        <Link to="/new">
          <Button variant="primary">
            <Plus size={14} />
            New Feature
          </Button>
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <p className="text-muted text-sm">No active features yet.</p>
          <Link to="/new">
            <Button variant="primary">
              <Plus size={14} />
              Create your first feature
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {active.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      )}
    </div>
  );
}
