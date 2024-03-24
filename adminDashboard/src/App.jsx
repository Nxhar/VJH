import './App.css';
import SideMenu from './NavPane/SideMenu';
import { Routes, Route } from 'react-router-dom';
import { auth, provider } from './_Firebase/firebaseConfig';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'; // Import User type
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard/Dashboard';
import DashboardIndividual from './Dashboard/DashboardIndividual';


function App() {
  const [user, setUser] = useState(null); // Explicitly define User | null type
  const [userPresent, setUserPresent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if(authUser){
        setUser(authUser);
          setUserPresent(true);
      }
      else{
        setUser(null)
        setUserPresent(false)
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleGoogleAuth = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      {!userPresent ? (
        <div>
          <div onClick={handleGoogleAuth}>Sign In With Google</div>
        </div>
      ) : (
        <div className="flexMain">
          <SideMenu user={user} />
          <Routes>
              <Route path='/dashboard' element={<Dashboard />} /> 
              <Route path='/dashboard/:id' element={<DashboardIndividual />} />   
            
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
