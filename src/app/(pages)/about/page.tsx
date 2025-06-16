import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - STI Race Connect',
  description: 'Learn about STI Race Connect and our mission to revolutionize race event management.',
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About STI Race Connect
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing race event management through innovative technology and seamless user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                STI Race Connect was born from the need to simplify and enhance the race event management experience. 
                We believe that organizing, participating in, and managing racing events should be seamless, 
                efficient, and enjoyable for everyone involved.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading platform that connects race organizers, marshals, and participants 
                worldwide, fostering a vibrant community built around the passion for racing and competitive sports.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">🏁</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Event Management</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive tools for organizing and managing racing events from start to finish.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Live race tracking, timing, and performance analytics for participants and spectators.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">🏆</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Rankings & Results</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed rankings, leaderboards, and historical performance data.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-6">Join Our Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're an event organizer, marshal, or participant, STI Race Connect provides 
              the tools and community you need to excel in the world of competitive racing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Get Started Today
              </button>
              <button className="border border-border hover:bg-muted text-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 