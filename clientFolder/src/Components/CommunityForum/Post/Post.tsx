import { useParams } from "react-router-dom"
import { useState, useEffect } from 'react'
import { db } from "../../../_Firebase/firebaseConfig"; 
import { getDoc, serverTimestamp, doc, getDocs, collection, addDoc } from "firebase/firestore";
import RightPane from "../RightPane/RightPane";
import '../communityforum.css'
import SendIcon from '@mui/icons-material/Send';

interface PostData {
  title: string;
  creator: string;
  timestamp: { seconds: number };
  description: string;
  imageUrl: string;
}
 
function Post({user}) {

  const userIcon = user?user.photoURL:'';
  const { id } = useParams();

  const postDocument = doc(db, 'posts', id)


  const fetchCommentData = async (docRef) => {
    try {
      const dataCollection = collection(docRef, 'comments');
      const dataSnapshot = await getDocs(dataCollection);
  
      const newData = dataSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Sort comments by timestamp if present
      newData.sort((a, b) => {
        const timestampA = a.timestamp?.seconds || 0;
        const timestampB = b.timestamp?.seconds || 0;
        return timestampB - timestampA;
      });
  
      setCommentsData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  
  const handlePostComment = async () => {
    if (comment.trim() === '') {
      return;
    }
  
    // Logic to post comment
    const newComment = {
      comment: comment,
      commentor: user.displayName,
      commentorPhoto: userIcon,
      timestamp: serverTimestamp(),
    };
  
    try {
      const postRef = doc(db, 'posts', id);
  
      // Reference to the 'comments' subcollection within the parent post document
      const commentsRef = collection(postRef, 'comments');
  
      // Use addDoc to add a document to the 'comments' subcollection
      const docRef = await addDoc(commentsRef, newComment);
      console.log('Comment document written with ID: ', docRef.id);
  
      // Set the comment input to an empty string after successfully adding a comment
      setComment('');
  
      // Fetch updated comment data after adding the new comment
      fetchCommentData(postRef);
    } catch (err) {
      console.error('Error adding comment document: ', err);
    }
  };
  

    

  // Comments : comment, commentor, commentorPhoto, timestamp



    
    // State to store the post data

    const [postData, setPostData] = useState<PostData>({});


    const [comment, setComment] = useState('')

    const [commentsData, setCommentsData] = useState([])
    

    const handleKeyPress = (e) => {
      if(e.key == 'Enter')
      {
        handlePostComment()
      }
    }


    // Fetching a document from firebase with id
    
    useEffect(() => {

      

        const fetchData = async () => {
          try {
            const docRef = doc(db, 'posts', id)
            const docSnap = await getDoc(docRef)
            

            if(docSnap.exists()){
                setPostData(docSnap.data())

                fetchCommentData(docRef)

            }
            else{
                console.error('Page not found')
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        
    
        fetchData();
        fetchCommentData(postDocument);
      }, []);



  return (
    <>
    <div className="displayPostBox">

      <div className="displayPost">
        <div className="postrow1">
          <img src={postData.photoUrl} alt="" />
          <div className="containerForRow1">
            <div className="postTitle">{postData.title} </div>
              <div className="postAskedBy">
                  Shared by : {postData?.creator} at
                  <div className="timestamp">
                      {postData.timestamp && new Date(postData.timestamp.seconds * 1000).toLocaleString()}
                  </div>
              </div>
            </div>  
        </div>

        <div className="postrow2">
        <div className="postDesc">{postData.description}</div>
        </div>
        
        <div className="postrow3">
        {postData.imageUrl && <img className="postImage" src={postData.imageUrl} alt="none" />}
        </div>
      </div>


      <div className="commentsBox">
        <img src={userIcon} alt="" />   
        <input type="text" className="commentBox" onKeyDown={handleKeyPress}
        placeholder="What would you like to comment?"
        value={comment} onChange={(e)=>{setComment(e.target.value)}}
        />
        <SendIcon className='btn' onClick={handlePostComment}/>        
      </div>

      <div className="commentsContainer">
        {
        commentsData ?. map((comment, index) => (
          <div key={index} className="commentContainer">
              <div className="commentrow1">
                <img src={comment.commentorPhoto} className="commentIcon" alt="" />
                <div className="commentor">{comment.commentor}</div>
                <div className="commentTimestamp">{comment.timestamp && new Date(comment.timestamp.seconds * 1000).toLocaleString()}</div>
              </div>
              
              <div className="actualComment">
                {comment.comment}
              </div>

              

              
            </div>
        ))}
      </div>
        
    </div>
    <RightPane user={user} context={postData.description}  />
    </>
  )
}

export default Post