import { useState } from "react"
const SignupCard = ({username,setUsername,password,setPassword, email, setEmail, name, setName})=>{

	const [passType, setPassType] = useState('password');

	const changeVisibility = ()=>{
		document.getElementsByClassName('eye-signup')[0].classList.toggle('d-none')
		document.getElementsByClassName('eye-slash-signup')[0].classList.toggle('d-none')
		passType === 'password'? setPassType('text'): setPassType('password');
	}

	const validateEmail = () => {
		return email.match(
		  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	  };

	const emailFilter = (data)=>{		
		setEmail(data.replaceAll(/[^a-z0-9A-Z@.]/g,'').toLowerCase());
		}

	const usernameFilter = (data)=>{		
		setUsername(data.replaceAll(/[^a-z0-9A-Z]/g,'').toLowerCase());
	}

    return (
        <div className="center-wrap">
										<div className="section text-center">
											<h4 className="mb-4 pb-3">Sign Up</h4>
											<div className="form-group">
												<input type="text" name="logname" className="form-style" placeholder="Your Full Name" id="signname" onChange={(e)=>setName(e.target.value)} value={name||''} autoComplete="off" />
												<i className="input-icon uil uil-user"></i>
											</div>
											<div className="form-group mt-2">
												<input type="text" name="logusername" className="form-style" placeholder="Your Username" id="signusername" onChange={(e)=>usernameFilter(e.target.value)} value={username || ''} autoComplete="off" />
												<i className="input-icon uil uil-user-circle"></i>
											</div>	
											<div className={email?(validateEmail()?"form-group mt-2":"form-group mt-2 form-warning"):"form-group mt-2"}>
												<input type="email" name="logemail" className="form-style" placeholder="Your Email" id="signemail" onChange={(e)=>emailFilter(e.target.value)} value={email || ''} autoComplete="off" />
												<i className="input-icon uil uil-at"></i>
											</div>	
											<div className="form-group mt-2">
												<input type={passType} name="logpass" className="pass-form-style" placeholder="Your Password" id="signpass" onChange={(e)=>setPassword(e.target.value)} value={password || ''}  autoComplete="off" />
												<i className="input-icon uil uil-lock-alt"></i>
												<i className="visibility-icon eye-signup uil uil-eye" onClick={()=>changeVisibility()}></i>
												<i className="visibility-icon eye-slash-signup uil uil-eye-slash d-none " onClick={()=>changeVisibility( )}></i>
											</div>
											<button type="submit" className="btn mt-4">submit</button>
				      					</div>
			      					</div>
    )
}

export default SignupCard;