import {useContext, useEffect, useState} from 'react';
import {UserContext} from '../UserContext.jsx';
import { Navigate, useParams} from 'react-router-dom';
import axios from 'axios';
import PlacesPage from './PlacesPage';
import AccountNav from '../AccountNav';

export default function ProfilePage () {
  const [redirect, setRedirect] = useState (null);
  const {ready, user, setUser} = useContext (UserContext);
  let {subpage} = useParams ();
  if (subpage === undefined) {
    subpage = 'profile';
  }

  async function logout () {
    await axios.post ('/logout');
    setRedirect ('/login');
    setUser (null);
  }

  useEffect (
    () => {
      axios
        .get ('/user-data')
        .then (response => {
          const userData = response.data;
          setUser (userData);
        })
        .catch (error => {
          console.error ('Error fetching user data:', error);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [setUser]
  );

  if (!ready) {
    return 'Loading...';
  }

  if (ready && !user && !redirect) {
    return <Navigate to={'/login'} />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }
  return (
    <div>
      <AccountNav />
      {subpage === 'profile' &&
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user.name} (email: {user.email})<br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>}
      {subpage === 'places' && <PlacesPage />}
    </div>
  );
}
