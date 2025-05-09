import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

// Simple app to verify rendering works
const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-900 to-dark p-4">
      <h1 className="text-4xl font-heading text-gold mb-4">Mystic Arcana</h1>
      <p className="text-light text-center max-w-md">
        Your journey into the mystical begins here. The stars are aligning to reveal your destiny.
      </p>
      <div className="mt-8 p-4 bg-dark/50 border border-gold/30 rounded-lg">
        <p className="text-gold">✨ App is rendering correctly!</p>
      </div>
    </div>
  );
};

// Use a try-catch to help debug any rendering issues
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found! Make sure your index.html has a div with id='root'");
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log("✅ React successfully mounted to #root");
} catch (error) {
  console.error("❌ Failed to render React app:", error);
  
  // Display error on page for easier debugging
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #fff; background: #1a1a2e;">
      <h1 style="color: #e63946;">React Rendering Error</h1>
      <pre style="background: #000; padding: 15px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <p>Check the console for more details.</p>
    </div>
  `;
}
