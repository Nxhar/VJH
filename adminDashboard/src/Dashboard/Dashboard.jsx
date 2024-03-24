import {useState, useEffect} from 'react'
import './rightPane.css'
import { db } from '../_Firebase/firebaseConfig'
import { collection, onSnapshot } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'

function Dashboard() {
    const [data, setData] = useState([])

    const [loading, setLoading] = useState(true)

  
    useEffect(() => {
        const fetchData = async () => {
          try {
            const dataCollection = collection(db, 'courses');
    
            // Use onSnapshot to listen for real-time updates
            const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
              const newData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) ;
    
              setData(newData);
              setLoading(false);
              console.log(newData)
            });
    
            // Return the unsubscribe function to clean up the listener when the component unmounts
            return () => unsubscribe();
          } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false); 
          }
        };
    
        fetchData();
      }, []);



  return (
    <div className='rightPane'>
    <div className='coursesContainer'>
      <h2 style={{textAlign:'center', fontSize:'30px'}}>Assess Yourselves</h2>
      <div style={{display:'flex', gap:'30px'}}>
        {loading ? (
            <div className="loader">
            Loading...
            </div>
        ) : (
    
        data&& data.map((course) => (
        <NavLink key={course.id} style={{textDecoration:'none',marginTop:'20px', borderRadius: '20px', height: '330px', color:'white', backgroundColor:'#9b51e0'}} 
        to={`/dashboard/${course.id}`} > 
        <div key={course.id} className="courseCard">
            
            <img className='image' src={course.imageUrl} alt="" />
            <h2>{course.name}</h2>
            <div className="profile">
            <img className='creator-icon' src={course.creatorPhoto} alt="" />
            <div className="text">By {course.creator}</div>
            </div>
        
        </div>
        </NavLink>  
    ))) } 
    </div>
    </div>
        
    </div>
  )
}

export default Dashboard