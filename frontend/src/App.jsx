import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('HOD'); // 'HOD', 'STAFF', 'STUDENT'
  const [currentMode, setCurrentMode] = useState('LOGIN'); // 'LOGIN', 'HOD', 'STAFF', 'STUDENT'

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    
    updateTime(); // Initial call
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setCurrentMode(selectedRole);
  };

  // Dedicated Mode Pages with just the mode name in it (no extras)
  if (currentMode === 'HOD') {
    return (
      <div className="mode-page-view">
        <button className="mode-back-btn" onClick={() => setCurrentMode('LOGIN')}>← Back to Login</button>
        <h1 className="mode-heading">HOD Mode</h1>
      </div>
    );
  }

  if (currentMode === 'STAFF') {
    return (
      <div className="mode-page-view">
        <button className="mode-back-btn" onClick={() => setCurrentMode('LOGIN')}>← Back to Login</button>
        <h1 className="mode-heading">Staff Mode</h1>
      </div>
    );
  }

  if (currentMode === 'STUDENT') {
    return (
      <div className="mode-page-view">
        <button className="mode-back-btn" onClick={() => setCurrentMode('LOGIN')}>← Back to Login</button>
        <h1 className="mode-heading">Students Mode</h1>
      </div>
    );
  }

  return (
    <div className="split-layout">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="left-top-text">CSE DEPARTMENT PORTAL</div>
        
        <div className="clock-widget">
          <div className="clock-ring"></div>
          <div className="clock-content">
            <div className="clock-time">{currentTime || "21:51"}</div>
            <div className="clock-date">{currentDate || "Mon, Oct 9"}</div>
          </div>
        </div>

        <div className="left-bottom-text">
          Welcome to VM-HUB.<br/>
          Your academic life, organized.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-form-container">
          
          <h1>Welcome back</h1>
          <p className="subtitle">Select your portal mode and sign in.</p>

          {/* Mode Selector Tabs */}
          <div className="mode-tabs">
            <button 
              type="button" 
              className={`mode-tab ${selectedRole === 'HOD' ? 'active' : ''}`}
              onClick={() => setSelectedRole('HOD')}
            >
              HOD Mode
            </button>
            <button 
              type="button" 
              className={`mode-tab ${selectedRole === 'STAFF' ? 'active' : ''}`}
              onClick={() => setSelectedRole('STAFF')}
            >
              Staff Mode
            </button>
            <button 
              type="button" 
              className={`mode-tab ${selectedRole === 'STUDENT' ? 'active' : ''}`}
              onClick={() => setSelectedRole('STUDENT')}
            >
              Students Mode
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>COLLEGE EMAIL</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@veltechmultitech.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Enter {selectedRole === 'HOD' ? 'HOD Mode' : selectedRole === 'STAFF' ? 'Staff Mode' : 'Students Mode'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
