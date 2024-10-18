import './App.css';
import SideMenu from './Components/NavPane/SideMenu';
import CommunityPane from './Components/CommunityForum/CommunityForum';
import { Routes, Route } from 'react-router-dom';
import { auth, provider } from './_Firebase/firebaseConfig';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import { useState, useEffect } from 'react';
import Post from './Components/CommunityForum/Post/Post';
import AIChat from './Components/AI Chat/AIChat';
import Assessments from './Components/Courses/Assessments';
import Assessment from './Components/Courses/Assessment/Assessment';
import Immersify from './Components/Immersify/Immersify';
import Graphic from './Components/Immersify/Graphic'
import Result from './Components/Courses/Result'
import MistralSpeak from './Components/Echo/MistralSpeak';

function App() {
  const [user, setUser] = useState<User | null>(null); // Explicitly define User | null type
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
            <Route path='/' element={<MistralSpeak /> } /> 
            {/* If comm forum is active link, display mid and right panes */}
            <Route path="/discussions" element={<CommunityPane user={user} />} />
            <Route path='/discussions/:id' element={<Post user={user}/>} />
            {/* <Route path="/aichat" element={<AIChat user={user} />} /> */}
            <Route path='/assessments' element={<Assessments user={user} /> } />
            <Route path='/assessments/:id' element={<Assessment user={user} /> } />
            <Route path='/immersify' element={<Immersify user={user} />} />
            <Route path='/immersify/:id' element={<Graphic />} />
            <Route path='/results' element={<Result />} />
           </Routes>
        </div>
      )}

      {/* {console.log(user?.photoURL)} */}
    </div>
  );
}

export default App;
