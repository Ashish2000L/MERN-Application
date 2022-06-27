import { useEffect,useState,lazy,Suspense } from "react";
import {Route,Routes, BrowserRouter as Router} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css'
import './App.css';

const LoginForm = lazy(()=>import("./routes/loginPage/loginPage"))
const PortfolioForm = lazy(()=>import("./routes/portfolioForm/portfolioForm"))


function App() {
  const [userIp,setUsetIp] = useState(null);

  function ComponenentMountScript(url,integrity=null,crossorigin=null,loadResult=null) {
    const script = document.createElement('script');
    script.async = false;
    script.src = url;
  
    if(integrity)
    script.integrity=integrity;
  
    if(crossorigin)
    script.crossOrigin=crossorigin;
  
    // script.onload = () => { 
    //   console.log("Script loaded "+url)
    // };
      
  
    document.body.appendChild(script);
  }

  ComponenentMountScript('https://code.iconify.design/2/2.2.1/iconify.min.js');

  useEffect(() => {
    
    var endpoint = 'https://ipapi.co/json/';
    const fetchUserIp = async()=>{

      var response = await fetch(endpoint);
      if(response.ok){
        setUsetIp(await response.json())
      }
    }

    fetchUserIp();
  },[]);

  return (
    
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm userIp={userIp}/>}/>
      <Route path="/reset-password/:token" element={<LoginForm forgotPass={true} check={true} userIp={userIp}/>}/>
      {/* <Route path="/signup" element={<LoginForm check={true}/>}/> */}
      <Route path="/portfolio" element={<PortfolioForm />} />
      </Routes>
    </Router>
  );
}

export default App;
