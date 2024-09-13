import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import GoogleOAuthSignIn from './pages/GoogleOAuthSignIn'; // Adjust the import path as necessary
import HomePage from './pages/HomePage'; // Adjust the import path as necessary
import { supabase } from './utils/supabaseClient'; 
import { Session } from '@supabase/gotrue-js';


function App() {
  // Declare the state to be either Session object or null
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Asynchronously fetch the session
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      setSession(session);
    };

    fetchSession();

  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<GoogleOAuthSignIn />} />
        <Route path="/" element={session ? <Navigate replace to="/home" /> : <Navigate replace to="/signin" />} />
        <Route path="/home" element={session ? <HomePage /> : <Navigate replace to="/signin" />} />
      </Routes>
    </Router>
  );
}

export default App;
