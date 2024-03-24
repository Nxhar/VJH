import { NavLink } from 'react-router-dom';
import './immersify.css';

function Immersify({ user }) {
  const cards = [
    {
      title: 'Visualizing the Solar System',
      id: 'b7c69a6b655b47c99f871d5ec5aee854',
      imageUrl: 'https://th.bing.com/th?id=OIP.GReBZ8UcxDXaSJSkJmBiaAHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
    },
    {
      title: 'Flame Color Tests of Alkali Metals',
      id: '57ed2f62488d41d78b8178a9be30de6d',
      imageUrl: 'https://th.bing.com/th/id/OIP.nXWXZxIz9LzJNwGUw2rgsQHaHa?w=202&h=202&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    },
  ];

  return (
    <div className="rightPane">
      <h2 style={{ fontSize: '50px', marginBottom: '10px' }}>Immersify</h2>
      <p className="immText">
        Welcome to Immersify! Where we immerse into the world of learning through well-defined 3D Graphics!
      </p>
      <h2 style={{ marginTop: '30px', marginBottom: '30px', fontSize: '40px' }}>Checkout these Immersive Experiences!</h2>

      {cards.map((card, index) => (
        <NavLink className='immCard' key={index} to={`/immersify/${card.id}`}>
          {/* You can add content here, for example, display card title or image */}
          <div 
             style={{
                padding: '15px 20px',
                borderRadius: '10px',
                backgroundImage: `url(${card.imageUrl})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '100%',
              }}
            >
            <h3>{card.title}</h3>
           
          </div>
        </NavLink>
      ))}
    </div>
  );
}

export default Immersify



// <div className="iframeEmbed"> <iframe frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/b7c69a6b655b47c99f871d5ec5aee854/embed"> </iframe> </div>

// b7c69a6b655b47c99f871d5ec5aee854  ,  57ed2f62488d41d78b8178a9be30de6d

// <div className=""> <iframe title="Flame Tests of Alkali Metals/ chemical reaction" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/57ed2f62488d41d78b8178a9be30de6d/embed"> </iframe></div>


