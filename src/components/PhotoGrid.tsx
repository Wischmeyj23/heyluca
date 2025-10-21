import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGridProps {
  urls: string[];
  onRemove?: (index: number) => void;
  readonly?: boolean;
}

export function PhotoGrid({ urls, onRemove, readonly = false }: PhotoGridProps) {
  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {urls.map((url, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated group">
          <img
            src={url}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {!readonly && onRemove && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
