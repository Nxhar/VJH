import './sidebar.css';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router-dom';
import { auth } from '../_Firebase/firebaseConfig'
import { signOut } from 'firebase/auth';


function SideMenu({ user }) {
  const userIcon = user.photoURL;

  const handleLogOut = () => {
    signOut(auth)
  }

  return (
    <div className="sidebar">
      <div style={{width:'200px'}} className="title">Gyaanavapi <br/> Dashboard</div>

      <NavLink
        to="/"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <HomeIcon />
        Home
      </NavLink>

      {/* <NavLink
        to="/discussions"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <MessageIcon />
        Discussions
      </NavLink> */}

      <NavLink
        to="/dashboard"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <LibraryBooksIcon />
        Dashboard
      </NavLink>

      

      <div className="option" style={{cursor:'pointer'}} onClick={handleLogOut}>
        <LogoutIcon /> 
        Logout
      </div>

      <div className="profile">
        <img className="profile-iconHere" src={userIcon} alt="" />
        <div className="textIn">
          <div className="name">{user.displayName}</div>
          <div className="email">{user.email}</div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
