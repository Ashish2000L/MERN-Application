import { useState } from "react";

const LoginCard = ({username,setUsername,password,setPassword, email, setEmail,setForgotPassword,forgotPassword})=>{

	const [passType,setPassType] = useState('password');

	const validateEmail = (email) => {
		return email.match(
		  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	  };

	const filter = (data)=>{
		data = data.replaceAll(/[^a-z0-9A-Z@.]/g,'')
		if(validateEmail(data)){
			setEmail(data.toLowerCase());
			setUsername(null);
		}else{
			setUsername(data.toLowerCase())
			setEmail(null);
		}

	}

	const changeVisibility = ()=>{
		document.getElementsByClassName('uil-eye')[0].classList.toggle('d-none')
		document.getElementsByClassName('uil-eye-slash')[0].classList.toggle('d-none')
		passType === 'password'? setPassType('text'): setPassType('password');
	}
    return (        
									<div className="center-wrap">
										{forgotPassword?<><div className="mb-3 ml-5 ">
										<i className="pd-2 input-icon uil uil-angle-left-b" onClick={()=>setForgotPassword(false)}></i>
										</div>
										<br /></>:null}
										<div className="section text-center">
											
											<h4 className="mb-4 pb-3">{forgotPassword?"Forgot Password":'Log In'}</h4>
											
											<div className="form-group">
												<input type="text" name="logemail" className="form-style" placeholder="Your Username / Email" onChange={(e)=>filter(e.target.value)} value={username || email || '' } autoComplete="off" />
												<i className="input-icon uil uil-at"></i>
											</div>	
											{forgotPassword?null:<div className="form-group mt-2">
												<input type={passType} name="logpass" className="pass-form-style" onChange={(e)=>setPassword(e.target.value)} placeholder="Your Password" id="logpass" value={password || ''}  autoComplete="off"/>
												<i className="input-icon uil uil-lock-alt"></i>
												<i className="visibility-icon uil uil-eye" onClick={()=>changeVisibility()}></i>
												<i className="visibility-icon uil uil-eye-slash d-none " onClick={()=>changeVisibility( )}></i>
											</div>}
											<button className="btn mt-4" type="submit">submit</button>
                            				{forgotPassword?null:<p className="mb-0 mt-4 text-center"><span className="link" onClick={()=>setForgotPassword(true)}>Forgot your password?</span></p>}
				      					</div>
			      					</div>
    )
}

export default LoginCard;