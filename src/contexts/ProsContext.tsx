import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

interface AppContextInterface {
  prosLogin: any;
  setProsLogin: Function;
  logOut: Function;
}

const ProsContext = createContext<AppContextInterface | null>(null);

export default ProsContext;

export const ProsContextProvider = ({ children }: any) => {
  const [prosLogin, setProsLogin] = useState<Array<object>>([]);


    // set current user to nothing !
    const logOut = async function() {
      return await axios.post('http://localhost:8000/api/auth/logout',{},{ withCredentials: true }) 
    }

  useEffect(() => {
    async function getProsLogin() {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/login', {
          withCredentials: true,
        });
        setProsLogin(response.data);
      } catch (err) {
        console.log(err);
      }
    }
    getProsLogin();
  }, []);

  return (
    <ProsContext.Provider value={{ prosLogin, setProsLogin, logOut }}>
      {children}
    </ProsContext.Provider>
  );
};