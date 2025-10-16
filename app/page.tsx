export default function Home() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to Symptiq
        </h1>
        <p className="text-text-secondary text-lg">
          Your personal health tracking companion
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Photo Tracking
            </h2>
            <p className="text-text-secondary">
              Capture and track visual changes with daily photos and AI-powered analysis
            </p>
          </div>

          <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Symptom Journal
            </h2>
            <p className="text-text-secondary">
              Log daily symptoms with intelligent follow-up questions
            </p>
          </div>

          <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Supplement Tracking
            </h2>
            <p className="text-text-secondary">
              Monitor supplement intake and timing for optimal results
            </p>
          </div>

          <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-2">
              AI Analysis
            </h2>
            <p className="text-text-secondary">
              Get insights and pattern detection from your health data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
