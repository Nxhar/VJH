import { useParams } from "react-router-dom"

function Graphic() {

  const cards = [
    {
      title: 'Visualizing the Solar System',
      id: 'b7c69a6b655b47c99f871d5ec5aee854',
      imageUrl: 'https://th.bing.com/th?id=OIP.GReBZ8UcxDXaSJSkJmBiaAHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
    },
    {
      title: 'Testing Flame Colors for Alkali Metals',
      id: '57ed2f62488d41d78b8178a9be30de6d',
      imageUrl: 'https://th.bing.com/th/id/OIP.nXWXZxIz9LzJNwGUw2rgsQHaHa?w=202&h=202&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    },
  ];

  const {id} = useParams()

  const card = cards.find((card)=> card.id === id)


  
  return (
    <div className="rightPane">
      <h1>{card.title}</h1>

      <div > <iframe className="iframeEmbed" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src={`https://sketchfab.com/models/${id}/embed`}> </iframe> </div>


    </div>
  )
}

export default Graphic