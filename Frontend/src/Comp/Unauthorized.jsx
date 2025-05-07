import React, { useState, useEffect } from 'react';
import { ShieldX, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

export default function Unauthorized() {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-red-500"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: '1px',
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.5 + 0.5,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className={`relative w-full max-w-lg p-8 mx-auto text-center rounded-lg backdrop-blur-sm transition-all duration-1000 ${animationComplete ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Red alert border */}
        <div className="absolute inset-0 rounded-lg border-2 border-red-500 opacity-50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-red-500"
                style={{
                  [i === 0 ? 'top' : i === 1 ? 'right' : i === 2 ? 'bottom' : 'left']: 0,
                  [i === 0 || i === 2 ? 'left' : 'top']: 0,
                  [i === 0 || i === 2 ? 'width' : 'height']: '100%',
                  [i === 0 || i === 2 ? 'height' : 'width']: '2px',
                  animation: `pulse 2s infinite ${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-2xl" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon with animated ring */}
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-red-900 bg-opacity-30 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-red-800 bg-opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldX size={56} className="text-red-500" />
            </div>
          </div>
          
          {/* Error code with animated glitch effect */}
          <div className="mb-3 font-mono text-red-500 text-xs tracking-widest relative">
            <span className="relative inline-block">
              ERROR <span className="animate-pulse">403</span>
            </span>
          </div>
          
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
            Access Denied
          </h1>
          
          <div className="flex items-center justify-center mb-6 text-red-400">
            <AlertTriangle size={18} className="mr-2" />
            <p className="font-medium">Unauthorized Access Detected</p>
          </div>
          
          <p className="mb-8 text-gray-300 max-w-md mx-auto">
            You don't have permission to access this resource. This incident has been logged and your system administrator has been notified.
          </p>
          
          {/* Buttons with hover effects */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="group w-full sm:w-auto px-6 py-3 flex items-center justify-center font-medium bg-transparent border border-gray-600 text-gray-300 rounded-md transition-all hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="group w-full sm:w-auto px-6 py-3 flex items-center justify-center font-medium bg-red-600 text-white rounded-md transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <Home size={16} className="mr-2 transition-transform group-hover:scale-110" />
              Return Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Simulated terminal messages */}
      <div className={`w-full max-w-lg mt-8 font-mono text-xs text-gray-500 transition-all duration-1000 ${animationComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="space-y-1 px-4">
          <p>[system]: <span className="text-red-400">Access violation detected</span></p>
          <p>[system]: <span className="text-gray-400">IP address logged: 192.168.1.***</span></p>
          <p>[system]: <span className="text-gray-400">Session terminated</span></p>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}