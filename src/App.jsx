import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './UserCredentials/Register_page';
import LoginPage from './UserCredentials/Login_page';
import MainDashboard from './Main Mech Component/Dashboard';

import PoEntry from './POEntry Component/PoEntry';

 
 
 

function App() {
  return (
    <>
        <Router>
          <Routes>

            {/* <Route path="/" element={<LandingPage/>}/> */}
            <Route path="/" element={<RegisterPage/>}/>
            <Route path="/loginbilling" element={<LoginPage/>}/>
             
            <Route path="/software/bellarybillingapplication/user/dashboard/details/" element={<MainDashboard/>}/>


            <Route path="/Poentry" element={<PoEntry/>}/>

             

          </Routes>
        </Router>
      
    </>
  )
}

export default App;
