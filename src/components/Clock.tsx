"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="clock-container" style={{ visibility: "hidden" }}>
        <div className="clock-circle"></div>
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  // Calculate rotation for the orange arc based on current time
  // Assuming a standard school day from 8:00 to 16:00 (8 hours)
  const startHour = 8;
  const endHour = 16;
  const totalMinutes = (endHour - startHour) * 60;
  
  // Calculate minutes elapsed since 8:00 AM
  let elapsedMinutes = (hours - startHour) * 60 + time.getMinutes();
  
  // Clamp values so the arc doesn't spin wildly at night
  if (elapsedMinutes < 0) elapsedMinutes = 0;
  if (elapsedMinutes > totalMinutes) elapsedMinutes = totalMinutes;

  const percentage = elapsedMinutes / totalMinutes;
  
  // SVG arc calculation (Stroke Dasharray)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;


  return (
    <div className="clock-container">
      <svg className="clock-svg" viewBox="0 0 200 200" width="200" height="200">
        {/* Background track */}
        <circle 
          cx="100" cy="100" r={radius} 
          fill="none" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="10" 
        />
        
        {/* Active Time Arc (Orange) */}
        <circle 
          cx="100" cy="100" r={radius} 
          fill="none" 
          stroke="var(--accent-orange, #f59e0b)" 
          strokeWidth="10" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          className="clock-arc"
        />

        {/* Inner Dark Circle */}
        <circle 
          cx="100" cy="100" r="75" 
          fill="rgba(0,0,0,0.4)" 
        />
        
        {/* Tick marks (simulated) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line 
            key={angle}
            x1="100" y1="5" x2="100" y2="15" 
            stroke="rgba(255,255,255,0.8)" 
            strokeWidth="3"
            transform={`rotate(${angle} 100 100)`}
          />
        ))}
      </svg>
      
      {/* Center Text */}
      <div className="clock-text">
        <span className="clock-time">{timeString}</span>
      </div>
    </div>
  );
}
