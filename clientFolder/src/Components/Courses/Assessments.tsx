import './courses.css'
import {useState, useEffect} from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../_Firebase/firebaseConfig'
import { HashLoader } from 'react-spinners'
import { NavLink } from 'react-router-dom'
function Courses() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    

    useEffect(()=>{
        const fetchData = async () => {
            try {
              const dataCollection = collection(db, 'courses');
      
              // Use onSnapshot to listen for real-time updates
              const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
                const newData = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
      
                setCourses(newData);
                setLoading(false);

                console.log(courses)
            })      

            return () => unsubscribe();
            } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            }
            };

        fetchData();
    }, []);

    

  return (
    <div className='coursesContainer'>
      <h2 style={{textAlign:'center', fontSize:'30px'}}>Assess Yourselves</h2>
      <div style={{display:'flex', gap:'30px'}}>
  {loading ? (
    <div className="loader">
      <HashLoader color='#9b51e0' />
    </div>
  ) : (
    
    courses?.map((course) => (
    <NavLink style={{textDecoration:'none',marginTop:'20px', borderRadius: '20px', height: '360px', color:'white', backgroundColor:'#9b51e0'}} to={`/assessments/${course.id}`} > 
      <div key={course.id} className="courseCard">
        
        <img className='image' src={course.imageUrl} alt="" />
        <h2>{course.name}</h2>
        <div className="profile">
            <img className='creator-icon' src={course.creatorPhoto} alt="" />
            <div className="text">By {course.creator}</div>
        </div>
        {/* Add more details or components as needed */}
      </div>
    </NavLink>
    ))
  )}
  </div>
</div>

  )
}


export default Courses