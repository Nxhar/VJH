import './sidebar.css';
// import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import MessageIcon from '@mui/icons-material/Message';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
// import SmartToyIcon from '@mui/icons-material/SmartToy';
import LogoutIcon from '@mui/icons-material/Logout';
import VrpanoIcon from '@mui/icons-material/Vrpano';
import { NavLink } from 'react-router-dom';
import { auth } from '../../_Firebase/firebaseConfig';
import { signOut } from 'firebase/auth';


interface SideMenuProps {
  user: {
    photoURL: string;
    displayName: string;
    email: string;
  };
}

function SideMenu({ user }: SideMenuProps): JSX.Element {
  const userIcon = user.photoURL;

  const handleLogOut = () => {
    signOut(auth)
  }

  return (
    <div className="sidebar">
      <div className="title">Gyaanavapi</div>

      {/* <NavLink
        to="/"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <KeyboardVoiceIcon />
        MistralEcho
      </NavLink> */}

      <NavLink
        to="/discussions"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <MessageIcon />
        Discussions
      </NavLink>

      <NavLink
        to="/assessments"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <LibraryBooksIcon />
        Assessments
      </NavLink>

      {/* <NavLink
        to="/aichat"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <SmartToyIcon />
        DocMistral
      </NavLink> */}

      <NavLink
        to="/immersify"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <VrpanoIcon />
        Immersify
      </NavLink>

      <div className="option" style={{cursor:'pointer'}} onClick={handleLogOut}>
        <LogoutIcon /> 
        Logout
      </div>

      <div className="profile">
        <img className="profile-iconHere" src={user.photoURL} alt="" />
        <div className="textIn">
          <div className="name">{user.displayName}</div>
          <div className="email">{user.email}</div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
