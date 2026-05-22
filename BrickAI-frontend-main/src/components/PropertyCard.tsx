import { Heart, MapPin, Bed, Bath, Maximize, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type VerdictTone = "positive" | "cautious" | "unclear";

export interface Property {
  id: string;
  title: string;
  address: string;
  suburb: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSize: string;
  propertyType: string;
  imageUrl: string;
  isFavorite?: boolean;
  estimatedYield?: string;
  tags?: string[];
  lat?: number;
  lng?: number;
  verdict: string;
  verdictTone: VerdictTone;
  reason: string;
  insights: string[];
  score?: number;
}

interface PropertyCardProps {
  property: Property;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
}

export function PropertyCard({ property, onToggleFavorite, onViewDetails }: PropertyCardProps) {
  const verdictStyles: Record<VerdictTone, string> = {
    positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cautious: "border-amber-200 bg-amber-50 text-amber-800",
    unclear: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white backdrop-blur-sm transition-all hover:border-gray-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <button
          onClick={() => onToggleFavorite(property.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white shadow-sm"
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              property.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-700"
            }`}
          />
        </button>

        {property.tags && property.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {property.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-white/90 text-xs text-gray-900 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Badge className={`${verdictStyles[property.verdictTone]} border px-3 py-1 hover:bg-inherit`}>
            {property.verdict}
          </Badge>
          {(property.score ?? property.estimatedYield) && (
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              <TrendingUp className="h-3 w-3" />
              <span>{property.score ? property.score.toFixed(1) : property.estimatedYield}</span>
            </div>
          )}
        </div>

        <p className="mb-3 text-sm leading-6 text-gray-900">{property.reason}</p>

        <div className="mb-2 text-sm font-medium text-gray-900">{property.price}</div>

        <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{property.address}, {property.suburb}</span>
        </div>

        <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{property.landSize}</span>
          </div>
        </div>

        {property.insights.length > 0 && (
          <div className="mb-4 space-y-2">
            {property.insights.slice(0, 2).map((insight) => (
              <div
                key={insight}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-5 text-gray-700"
              >
                {insight}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => onViewDetails(property)}
          className="h-9 w-full rounded-xl bg-gray-100 text-sm text-gray-900 transition-all hover:bg-gray-200"
          variant="ghost"
        >
          Open report
        </Button>
      </div>
    </div>
  );
}
