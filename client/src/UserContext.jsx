import {createContext, useEffect, useState} from "react";
import axios from "axios";
// import {data} from "autoprefixer";

export const UserContext = createContext({});

import PropTypes from 'prop-types';

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!user) {
      axios.get('/profile').then(({ data }) => {
        setUser(data);
        setReady(true);
      });
    }
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
