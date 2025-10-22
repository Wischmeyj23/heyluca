import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mic, Users, FileText, Zap } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-accent/20 blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Logo/Brand */}
          <div className="text-center mb-12">
            <img 
              src={new URL('@/assets/heyluca-logo.png', import.meta.url).href} 
              alt="HeyLuca" 
              className="h-16 sm:h-20 lg:h-24 mx-auto mb-6"
            />
            <p className="text-xl sm:text-2xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              "Never forget a conversation"
            </p>
          </div>

          {/* Main CTA */}
          <div className="text-center mb-16 space-y-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 h-auto shadow-brand hover:shadow-lg transition-all"
            >
              Get Started
              <ArrowRight className="ml-2" />
            </Button>
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth")}
                className="text-brand hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is HeyLuca */}
        <section className="mb-24">
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
              Your 360-second AI memory companion
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-4">
              HeyLuca is designed for professionals at meetings, conferences, and networking events.
            </p>
            <p className="text-lg text-text-muted leading-relaxed">
              You can't capture everything in the moment — but with HeyLuca, you can record your insights right after each connection.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-brand transition-colors">
              <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Save the contact</h3>
              <p className="text-text-muted">
                Quickly capture contact information and never lose a valuable connection.
              </p>
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-accent transition-colors">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Record your conversation</h3>
              <p className="text-text-muted">
                Record your side of the conversation and let HeyLuca organize it all.
              </p>
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-brand transition-colors">
              <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">AI-powered insights</h3>
              <p className="text-text-muted">
                Instantly organize notes with action items, reminders, and next steps.
              </p>
            </div>
          </div>
        </section>

        {/* Smart Conference Recap */}
        <section className="mb-24">
          <div className="bg-gradient-to-br from-brand/10 to-accent/10 border border-border rounded-2xl p-8 sm:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-brand-contrast" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                  Smart conference recap for your team
                </h2>
                <p className="text-lg text-text-muted leading-relaxed mb-4">
                  HeyLuca builds a comprehensive conference recap complete with action items, reminders, and next steps.
                </p>
                <p className="text-lg text-text-muted leading-relaxed">
                  Eliminate the long hours of post-event note-taking and follow-up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-text-muted leading-relaxed">
              To help professionals remember everything that matters.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-surface border border-border rounded-2xl p-12 shadow-brand">
            <h2 className="text-3xl font-bold text-text mb-4">
              Ready to never miss a follow-up again?
            </h2>
            <p className="text-lg text-text-muted mb-8">
              Start capturing what matters today.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 h-auto shadow-brand"
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-2">
            <img 
              src={new URL('@/assets/heyluca-logo.png', import.meta.url).href} 
              alt="HeyLuca" 
              className="h-8"
            />
            <p className="text-center text-text-muted">
              © 2025 Never forget what matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
