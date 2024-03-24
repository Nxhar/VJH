import MidPane from './MidPane/MidPane';
import RightPane from './RightPane/RightPane';
import './communityforum.css';
import FormToPost from './MidPane/FormToPost';
import { useState } from 'react';

interface Post {
  // Define the structure of a post
  uid: string;
  username: string;
  photoUrl: string;
  title: string;
  description: string;
  image: File | null;
}



function CommunityForum({user}) {
  

  return (
    <div className='forumContainer'>
      <div>
        <div className='displayBox'>
          <FormToPost  user={user}  />
        </div>
        <div className="displayBox">
          <MidPane  />
        </div>
      </div>
      <RightPane user={user} context={''} />
    </div>
  );
}

export default CommunityForum;
