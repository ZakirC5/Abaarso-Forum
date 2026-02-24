import app from './firebase.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Header from './components/Header.jsx'
import './Home.css'

const auth = getAuth(app)

function Home() {

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = '/dashboard'
    }
  })

  return (
    <>
      <Header />
      <main>
        <div className="cards">
          <div className="card">
            <div id="rightside-content">
              <h2>What’s Abaarso Forum?</h2>
              <p>Your school’s chill zone for questions, discussions, and hot takes. Basically the group chat… but organized.</p>
            </div>
          </div>
          <div className="card">
            <div id="leftside-content">
              <h2>Real-Time Threads</h2>
              <p>Conversations update fast, so you don’t feel like you’re emailing in 1998.</p>
            </div>
          </div>
          <div className="card">
            <div id="rightside-content">
              <h2>Polls & Opinions</h2>
              <p>Let the people vote on the important things, like which teacher gives the most chaotic assignments.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home
