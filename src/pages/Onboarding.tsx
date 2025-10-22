import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: Mic,
      title: "Record in 60 Seconds",
      description: "Capture your thoughts right after any conversation. Just tap the mic and speak for up to 60 seconds.",
      color: "text-brand",
    },
    {
      icon: Sparkles,
      title: "Instant Summary",
      description: "AI automatically transcribes and generates a 3-point summary with key takeaways from your recording.",
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "Never Miss a Follow-Up",
      description: "Get automatic next step suggestions with due dates, so you always know what to do and when.",
      color: "text-warning",
    },
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-bg to-surface">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-brand bg-clip-text text-transparent">
            HeyLuca
          </h1>
          <p className="text-text-muted">Your follow-up memory assistant</p>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-surface-elevated flex items-center justify-center">
            <Icon className={`w-12 h-12 ${currentSlide.color}`} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">{currentSlide.title}</h2>
          <p className="text-text-muted text-lg leading-relaxed">
            {currentSlide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === step 
                  ? "w-8 bg-brand" 
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleNext}
            className="w-full gap-2"
          >
            {step < slides.length - 1 ? "Next" : "Get Started"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          {step < slides.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
