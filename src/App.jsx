import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './UserCredentials/Register_page';
import LoginPage from './UserCredentials/Login_page';
import MainDashboard from './Main Mech Component/Dashboard';

import PoEntry from './POEntry Component/PoEntry';

import PoentrydatabseseTable from './POEntry Component/POentryDatabaseTable';
import VendorProfile from './VendorComponent/VendorProfile';
import UserTabs from './VendorComponent/UserTabs';
import LedgerCreation from './VendorComponent/LedgerCreation';

import Kaaa from './VendorComponent/KKK';

import Invoice from './InvoiceComponent/Invoice';

 
 
 

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

            <Route path="/poentryyyyy" element={<PoentrydatabseseTable/>}/>

            
            <Route path="/usertabs/puser/rofile/details" element={<UserTabs/>}/>

            <Route path="/vendor/user/profile/details" element={<VendorProfile/>}/>
             
            <Route path="/customer/puser/rofile/details" element={<LedgerCreation/>}/>

            <Route path="/Kaaa" element={<Kaaa/>}/>

            <Route path="/invoice/management/bellaryinfotech/billing/software" element={<Invoice/>}/>




             

          </Routes>
        </Router>
      
    </>
  )
}

export default App;
