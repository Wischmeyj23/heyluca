import { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  onStart: () => void;
  onStop: (duration: number) => void;
  maxDuration?: number;
  disabled?: boolean;
}

export function RecordButton({ 
  onStart, 
  onStop, 
  maxDuration = 60,
  disabled = false 
}: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, maxDuration]);

  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      handleStop();
    }
  }, [duration, isRecording, maxDuration]);

  const handleStart = () => {
    setDuration(0);
    setIsRecording(true);
    onStart();
  };

  const handleStop = () => {
    setIsRecording(false);
    const finalDuration = duration;
    setDuration(0);
    onStop(finalDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (duration / maxDuration) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Progress ring */}
        {isRecording && (
          <svg className="absolute inset-0 -rotate-90" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="4"
            />
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 74}`}
              strokeDashoffset={`${2 * Math.PI * 74 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}
        
        {/* Record button */}
        <Button
          size="lg"
          disabled={disabled}
          onClick={isRecording ? handleStop : handleStart}
          className={cn(
            "w-40 h-40 rounded-full transition-all duration-300",
            isRecording 
              ? "bg-error hover:bg-error/90 shadow-lg shadow-error/30" 
              : "bg-brand hover:bg-brand-hover shadow-brand"
          )}
        >
          {isRecording ? (
            <Square className="w-12 h-12" fill="currentColor" />
          ) : (
            <Mic className="w-12 h-12" />
          )}
        </Button>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-1">
        {isRecording ? (
          <>
            <span className="text-3xl font-bold text-text tabular-nums">
              {formatTime(duration)}
            </span>
            <span className="text-sm text-text-muted">
              {maxDuration - duration}s remaining
            </span>
          </>
        ) : (
          <span className="text-sm text-text-muted">
            Tap to record (max {maxDuration}s)
          </span>
        )}
      </div>
    </div>
  );
}
