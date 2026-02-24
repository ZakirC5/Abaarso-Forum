import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";
import app from '../firebase.js';
import './Header.css';

import logo from '../assets/logo.webp';
import searchIcon from '../assets/search.svg';

const auth = getAuth(app);
const db = getFirestore(app);

function Header() {
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            try {
                const postsRef = collection(db, "posts");
                const snapshot = await getDocs(postsRef);
                const list = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(post => 
                        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.body.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 3); // show top 3 matches
                setResults(list);
            } catch (err) {
                console.error(err);
            }
        };

        fetchResults();
    }, [searchTerm]);

    return (
        <header className='header'>
            <a href="/"><img src={logo} alt="logo" id='logo' /></a>

            <div className="searchbar">
                <img src={searchIcon} alt="search" width={35} height={35} />
                <input
                    type="search"
                    placeholder='Search here...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {results.length > 0 && (
                    <ul className="search-results">
                        {results.map(post => (
                            <li key={post.id}>
                                <a href={`/view/${post.id}`}>{post.title}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!user && <a href="/login" id='login-btn'>Login</a>}
        </header>
    );
}

export default Header;
