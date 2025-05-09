import React from 'react';
import { Route, Switch } from 'wouter';
import DailyTarotPage from './src/pages/daily-tarot';
import { View, Home } from 'lucide-react';
import { Page } from 'openai/pagination.mjs';

const App: React.FC = () => {
  return (
    <div className="app">
      <Switch>
        <Route path="/" component={() => (
          <div className="cosmic-container">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="clouds"></div>
            
            <div className="content-container flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl md:text-6xl text-center mb-8 text-shadow-lg">
                Mystic Arcana
              </h1>
              <p className="text-xl text-center max-w-lg mb-12">
                Explore the mysteries of the universe through tarot and astrology
              </p>
              <a 
                href="/daily-tarot" 
                className="px-6 py-3 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors text-lg"
              >
                View Your Daily Card
              </a>
            </div>
          </div>
        )} />
        <Route path="/daily-tarot" component={DailyTarotPage} />
        <Route>
          <div className="cosmic-container">
            <div className="content-container flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl text-center mb-8">Page Not Found</h1>
              <a 
                href="/" 
                className="px-6 py-3 bg-primary-700 hover:bg-primary-600 rounded-md transition-colors"
              >
                Return Home
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
