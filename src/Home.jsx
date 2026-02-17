import app from './firebase.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Header from './components/Header.jsx'
import './Home.css'

import qmark from './assets/qmark.png'
import fast_threads from './assets/fast-threads.jpg'
import poll from './assets/poll.png'

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
            <div id="leftside-image">
              <img src={qmark} alt="question marks" />
            </div>
            <div id="rightside-content">
              <h2>What’s Abaarso Forum?</h2>
              <p>Your school’s chill zone for questions, discussions, and hot takes. Basically the group chat… but organized.</p>
            </div>
          </div>
          <div className="card">
            <div id="rightside-image">
            <img src={fast_threads} alt="fast threads" />
            </div>
            <div id="leftside-content">
              <h2>Real-Time Threads</h2>
              <p>Conversations update fast, so you don’t feel like you’re emailing in 1998.</p>
            </div>
          </div>
          <div className="card">
            <div id="leftside-image">
              <img src={poll} alt="" />
            </div>
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
