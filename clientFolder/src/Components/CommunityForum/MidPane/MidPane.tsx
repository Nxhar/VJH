import { db } from '../../../_Firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HashLoader } from 'react-spinners';

interface Post {
  id:string;
  uid: string;
  username: string;
  photoUrl: string;
  title: string;
  creator: string;
  description: string;
  imageUrl: string;
  timestamp: { seconds: number };
}

function MidPane(): JSX.Element {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(db, 'posts');

        // Use onSnapshot to listen for real-time updates
        const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
          const newData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];

          setData(newData);
          setLoading(false);
        });

        // Return the unsubscribe function to clean up the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className='posts'>
      <h2 className='discussions'>All Discussions</h2>
      {loading ? (
        <div className="loader">
          <HashLoader color='#9b51e0'  />
        </div>
      ) : (
        data.map((post) => (
          <NavLink key={post.id} style={{ textDecoration: 'none' }} to={`/discussions/${post.id}`}>
            <div key={post.id} className='post'>
              {post.photoUrl && <img src={post.photoUrl} className='photoUrl' alt='Post' />}
              <div className='col_2'>
                <h2>{post.title}</h2>
                <div className='askedBy'>
                  Shared by : {post.creator}
                  <div className='timestamp'>{new Date((post.timestamp.seconds || 0) * 1000).toLocaleString()}</div>
                </div>
              </div>
              {post.imageUrl && <img src={post.imageUrl} className='imageUrl' alt=' ' />}
            </div>
          </NavLink>
        ))
      )}
    </div>
  );
}

export default MidPane;