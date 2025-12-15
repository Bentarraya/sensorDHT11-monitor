import Dashboard from '@/components/dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Smart Climate Tracker
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Real-time temperature and humidity monitoring from your ESP32 sensor. This dashboard provides a live view of your environment.
          </p>
        </header>
        
        <Dashboard />

      </div>
    </main>
  );
}
