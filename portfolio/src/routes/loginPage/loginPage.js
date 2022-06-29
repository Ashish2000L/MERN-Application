import React from 'react'
import LoginCard from '../../components/loginComponents/login';
import SignupCard from '../../components/loginComponents/signup';
import EmailVerify from '../../components/loginComponents/verifyEmail';
import NavHeader from '../../components/loginComponents/header';
import CopyrightFooter from '../../components/loginComponents/copyrightFooter';
import ResetPassword from '../../components/loginComponents/resetPassword';
import { useState,useEffect,useRef } from 'react';
import cryptojs from 'crypto-js'
import {ToastContainer,toast, Bounce} from 'react-toastify'
import {BoxLoading} from 'react-loadingg';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import "./styles.css";
import 'react-toastify/dist/ReactToastify.min.css';

const LoginForm = ({check=false,forgotPass=false,userIp=null})=>{

	const [checkbox, setCheckbox] = useState(check);
	const [email, setEmail] = useState(null);
	const [name,setName] = useState(null);
	const [username,setUsername] = useState(null);
	const [password, setPassword] = useState(null);
	const [otp, setOtp] = useState(null);
	const [verify,setVerify] = useState(false);
	const [forgetPass1,setforgetPass1] = useState(null);
    const [forgetPass2,setforgetPass2] = useState(null);
	const [loading,setLoading] = useState("none");
	const [forgotPassword,setForgotPassword] = useState(false);
	const [resetPasswordConst, setResetPasswordConst]  = useState(forgotPass);	

	const TimeOutRef = useRef(null);

	const {token} = useParams();	
	const params = new URLSearchParams(useLocation().search);
	const navigate = new useNavigate();
	const SITE_KEY = "6LeZjCMgAAAAAMh1jdQbw6SL-hxZyjgu_UsCCOHB"

	let headers = new Headers();
	let userAddr = null;

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');	

	useEffect(() => {
		const loadScriptByURL = (id, url, callback) => {
		  const isScriptExist = document.getElementById(id);
	   
		  if (!isScriptExist) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			script.id = id;
			script.onload = function () {
			  if (callback) callback();
			};
			document.body.appendChild(script);
		  }
	   
		  if (isScriptExist && callback) callback();
		}
	   
		loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, function () {
		  console.log("Script loaded!");
		});
		loadScriptByURL("api-script","https://www.google.com/recaptcha/api.js?trustedtypes=true")
	  }, []);

	const getGCaptchToken = async() => {			
		
		//  window.grecaptcha.ready(() => {
		//   window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(token=>{
				
		//   		});
		// });	
		let token = "";
        await window.grecaptcha.execute(SITE_KEY, {action: "submit"})
            .then((res) => {
                token = res;
            })
        return token;	
	  }

	useEffect(() => {
		setEmail(null);
		setName(null);
		setPassword(null);
		setUsername(null);
		setforgetPass1(null);
		setforgetPass2(null);
	}, [checkbox,forgotPassword]);

	if(localStorage.getItem("AuthToken"))
	{
		
			navigate("/ecommerce")

		return;
	}

	const loginOnSubmit = async (e)=>{
		e.preventDefault();

		if(!email && !username){
		return toast.error("Email/Username cannot me empty!",{
			position:toast.POSITION.TOP_RIGHT,
			autoClose:5000,
			toastId:"email",
			theme:"dark",
			pauseOnFocusLoss:true,
		});
		}
		

		if(!password){
			return toast.error("Password cannot me empty!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"email",
				theme:"dark",
				pauseOnFocusLoss:true,
			});
			
			}

			setLoading('flex');

			setPassword(cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(password)))
			let pass = cryptojs.enc.Hex.stringify(cryptojs.SHA1(password));			
	
			var gToken= await getGCaptchToken()

			if (userIp)
			 userAddr= cryptojs.enc.Hex.stringify(cryptojs.SHA1(userIp.ip));

			headers.append("cookies",`userAddr=${userAddr||''}`)
			
			fetch('https://apiservicemanager.azurewebsites.net/member/login',{
				method:'POST',
				mode:'cors',
				headers: headers,
				body: JSON.stringify(Object.entries({email:email,username:username, password:pass,gRecaptchaResponse: gToken}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {}))
			}).then(
				async response => {
					setLoading('none');

					delete headers['cookies']

					const isJson = response.headers.get('content-type')?.includes('application/json');
					const data = isJson && await response.json();

					if (!response.ok) {
						// get error message from body or default to response status						
						const error = (data && data.message) || response.status;
						if((data instanceof Object)){
							if(data.statusCode === 'EmailUnverified')
								{
									window.sessionStorage.setItem("userDetails",JSON.stringify(Object.entries({email,username}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {})))
									setVerify(true);
									toast.info("Please check your Email and enter OTP.",{
										position:toast.POSITION.TOP_RIGHT,
										autoClose:5000,
										toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
										theme:"dark",
										delay:3000,
										pauseOnFocusLoss:false
									});
								
								}else if(data.statusCode === 'ProxyError'){
									toast.info("Please use different network preferably cellular network.",{
										position:toast.POSITION.TOP_RIGHT,
										autoClose:5000,
										toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
										theme:"dark",
										delay:3000,
										pauseOnFocusLoss:false
									});
								}
						}
						return toast.error(error,{
							position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
							theme:"dark",
							pauseOnFocusLoss:false
						});
					}else{	
						
						let auth = response.headers.get("Authorization")
						if(!auth){
							return toast.error("Failed to Login, Please try again!", {position:toast.POSITION.TOP_RIGHT,
								autoClose:5000,
								toastId:"NullToken",
								theme:"dark",
								pauseOnFocusLoss:false})
						}

						localStorage.setItem("AuthToken",auth);

						navigate("/ecommerce");
						return ;
						// return toast.success("Loggedin Successfully!", {position:toast.POSITION.TOP_RIGHT,
						// 	autoClose:5000,
						// 	toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
						// 	theme:"dark",
						// 	pauseOnFocusLoss:false})
					}
				}
			).catch(error => {
				setLoading('none');
				toast.error("Internal error occured!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:'error',
					theme:"dark",
					pauseOnFocusLoss:false
				});
				console.error('There was an error!', error);
			})
			
	}

	const signupOnSubmit = async(e)=>{
		e.preventDefault();

		if(!name){
		return toast.error("Name cannot me empty!",{
			position:toast.POSITION.TOP_RIGHT,
			autoClose:5000,
			toastId:"email",
			theme:"dark",
			pauseOnFocusLoss:true,
		});
		}
		
		if(!username){
			return toast.error("Username cannot me empty!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"email",
				theme:"dark",
				pauseOnFocusLoss:true,
			});
			}

			if(!email){
				return toast.error("Email cannot me empty!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:"email",
					theme:"dark",
					pauseOnFocusLoss:true,
				});
				}

		if(!password){
			return toast.error("Password cannot me empty!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"email",
				theme:"dark",
				pauseOnFocusLoss:true,
			});
			
			}	

			setLoading('flex');

			setPassword(cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(password)))		
			let pass = cryptojs.enc.Hex.stringify(cryptojs.SHA1(password))

			var gToken = await getGCaptchToken()
	
			fetch('https://apiservicemanager.azurewebsites.net/member/register',{
				method:'POST',
				mode:'cors',
				headers: headers,
				body: JSON.stringify(Object.entries({name:name,email:email,username:username,password:pass,gRecaptchaResponse: gToken}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {}))
			}).then(
				async response => {
					setLoading('none');
					const isJson = response.headers.get('content-type')?.includes('application/json');
					const data = isJson && await response.json();
		
				
					if (!response.ok) {
						const error = (data && data.message) || response.status;
						return toast.error(error,{
							position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(error)),
							theme:"dark",
							pauseOnFocusLoss:false,
						});
					}else{
						setVerify(true);
						setCheckbox(false);

						window.sessionStorage.setItem("userDetails",JSON.stringify(Object.entries({email,username}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {})))

						toast.success("Successfully Registered!", {position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
							theme:"dark",
							pauseOnFocusLoss:false})

						return toast.info("Please verify you Email!",{position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:"verifyInfo",
							theme:"dark",
							delay:3000,
							pauseOnFocusLoss:false})
					}
				}
			).catch(error => {
				setLoading('none');
				toast.error("Internal error occured!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:'error',
					theme:"dark",					
					pauseOnFocusLoss:false
				});
				console.error('There was an error!', error);
			})
	}


	const verifyOnSubmit = (e)=>{
		e.preventDefault();
		

		if(!otp){
			return toast.error("Your OTP cannot me empty!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"email",
				theme:"dark",
				pauseOnFocusLoss:true,
			});
			
			}	
			
			setLoading('flex');

			fetch('https://apiservicemanager.azurewebsites.net/member/verify',{
				method:'POST',
				mode:'cors',
				headers: headers,
				body: JSON.stringify(Object.assign(JSON.parse(window.sessionStorage.getItem("userDetails")),{otp:otp}))
			}).then(
				async response => {
					setLoading('none');
					const isJson = response.headers.get('content-type')?.includes('application/json');
					const data = isJson && await response.json();
		
				
					if (!response.ok) {
						const error = (data && data.message) || response.status;
						return toast.error(error,{
							position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(error)),
							theme:"dark",
							pauseOnFocusLoss:false,
						});
					}else{
						setVerify(false);
						toast.success("Successfully verified!", {position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
							theme:"dark",
							pauseOnFocusLoss:false})

						return toast.info("Please proceed to Login again.",{position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:"verifyInfo",
							theme:"dark",
							delay:3000,
							pauseOnFocusLoss:false})
					}
				}
			).catch(error => {
				setLoading('none');
				toast.error("Internal error occured!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:'error',
					theme:"dark",					
					pauseOnFocusLoss:false
				});
				console.error('There was an error!', error);
			})
	}

	const resendEmail = (e)=>{		
		e.preventDefault();

		if(!window.sessionStorage.getItem('userDetails')){
			return toast.error("Session Expired!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"sessionExpired",
				theme:"dark",
				pauseOnFocusLoss:false,
			});
		}

		setLoading('flex');

		fetch('https://apiservicemanager.azurewebsites.net/member/sendEmail',{
					method:'POST',
					mode:'cors',
					headers: headers,
					body: window.sessionStorage.getItem('userDetails')
				}).then(
					async response => {
						setLoading('none');
						const isJson = response.headers.get('content-type')?.includes('application/json');
						const data = isJson && await response.json();
			
					
						if (!response.ok) {
							const error = (data && data.message) || response.status;
							return toast.error(error,{
								position:toast.POSITION.TOP_RIGHT,
								autoClose:5000,
								toastId:data.statusCode,
								theme:"dark",
								pauseOnFocusLoss:false,
							});
						}else{
							return toast.success(data.message, {position:toast.POSITION.TOP_RIGHT,
								autoClose:5000,
								toastId:data.statusCode,
								theme:"dark",
								pauseOnFocusLoss:false})
	
							// return toast.info("Try next resend after 5 min",{position:toast.POSITION.TOP_RIGHT,
							// 	autoClose:5000,
							// 	toastId:"verifyInfo",
							// 	theme:"dark",
							// 	delay:3000,
							// 	pauseOnFocusLoss:false})
						}
					}
				).catch(error => {
					setLoading('none');
					toast.error("Internal error occured!",{
						position:toast.POSITION.TOP_RIGHT,
						autoClose:5000,
						toastId:'error',
						theme:"dark",					
						pauseOnFocusLoss:false
					});
					console.error('There was an error!', error);
				})
	  }


	  const forgotPasswordOnSubmit = (e)=>{
		e.preventDefault();
		
		if(!email && !username){
			return toast.error("Email/Username cannot me empty!",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"email",
				theme:"dark",
				pauseOnFocusLoss:true,
			});
			}
		
			
			setLoading('flex');

			fetch('https://apiservicemanager.azurewebsites.net/member/forgotPassword',{
				method:'POST',
				mode:'cors',
				headers: headers,
				body: JSON.stringify(Object.entries({email,username}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {}))
			}).then(
				async response => {
					setLoading('none');
					const isJson = response.headers.get('content-type')?.includes('application/json');
					const data = isJson && await response.json();
		
				
					if (!response.ok) {
						const error = (data && data.message) || response.status;
						return toast.error(error,{
							position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(error)),
							theme:"dark",
							pauseOnFocusLoss:false,
						});
					}else{
						setForgotPassword(false)
						toast.success("Successfully sent email!", {position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
							theme:"dark",
							pauseOnFocusLoss:false})

						return toast.info("Please check your email for further steps.",{position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:"ForgotEmail",
							theme:"dark",
							delay:3000,
							pauseOnFocusLoss:false})
					}
				}
			).catch(error => {
				setLoading('none');
				toast.error("Internal error occured!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:'error',
					theme:"dark",					
					pauseOnFocusLoss:false
				});
				console.error('There was an error!', error);
			})
	}

	const resetPasswordOnSubmit = async(e)=>{
		e.preventDefault();
		
		if(!forgetPass1 & !forgetPass2){
			return toast.error("New Password/Confirm Password cannot be empty",{
				position:toast.POSITION.TOP_RIGHT,
				autoClose:5000,
				toastId:"emptyForgotPass",
				theme:"dark",
				pauseOnFocusLoss:true,
				});
			}
		
			if(forgetPass1 !== forgetPass2){
				return toast.error("Passwords do not match!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:"passwordNotMatch",
					theme:"dark",
					pauseOnFocusLoss:true,
					});
				}

			setLoading('flex');

			setforgetPass2(cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(forgetPass2)))
			let pass = cryptojs.enc.Hex.stringify(cryptojs.SHA1(forgetPass2))

			var gToken= await getGCaptchToken()

			fetch('https://apiservicemanager.azurewebsites.net/member/resetPassword',{
				method:'POST',
				mode:'cors',
				headers: headers,
				body: JSON.stringify(Object.entries({uid:params.get("uid"),e:params.get("e"),token:token,newPassword:pass,gRecaptchaResponse: gToken}).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {}))
			}).then(
				async response => {
					setLoading('none');
					const isJson = response.headers.get('content-type')?.includes('application/json');
					const data = isJson && await response.json();
		
				
					

					if (!response.ok) {
						const error = (data && data.message) || response.status;

						if(data.statusCode === 'TokenExpired'){
							navigate('/');
							setCheckbox(false);
							setResetPasswordConst(false);
						}

						return toast.error(error,{
							position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(error)),
							theme:"dark",
							pauseOnFocusLoss:false,
						});
					}else{
						navigate('/');
						setCheckbox(false);
						setResetPasswordConst(false);

						toast.success("Password Reset!", {position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(data.statusCode)),
							theme:"dark",
							pauseOnFocusLoss:false})

						return toast.info("Please proceed to Login again.",{position:toast.POSITION.TOP_RIGHT,
							autoClose:5000,
							toastId:"ForgotEmail",
							theme:"dark",
							delay:3000,
							pauseOnFocusLoss:false})
					}
				}
			).catch(error => {				
				setLoading('none');
				setCheckbox(false);
				setResetPasswordConst(false);
				toast.error("Internal error occured!",{
					position:toast.POSITION.TOP_RIGHT,
					autoClose:5000,
					toastId:'error',
					theme:"dark",					
					pauseOnFocusLoss:false
				});
				console.error('There was an error!', error);
			})
	}
	
    return (
        <div>
				<ToastContainer limit={3} draggablePercent={60} transition={Bounce} role="alert" draggable pauseOnHover/>
			<div className='loading' style={{width:"100%",height:"100%",position:"fixed",display:loading}}>
				<BoxLoading size="large" color="#ffeba7"/>
			</div>

		<NavHeader />

	<div className="section">
		<div className="container">
			<div className="row full-height justify-content-center">
				<div className="col-12 text-center align-self-center py-5">
					<div className="section pb-5 pt-5 pt-sm-2 text-center">
						<h6 className="mb-0 pb-3"><span>{forgotPassword?"Forget":(verify?"Verify":"Log In")} </span><span>{resetPasswordConst? "Reset" :'Sign Up'}</span></h6>
			          	<input className="checkbox" type="checkbox" onClick={(e)=>setCheckbox(!checkbox)} id="reg-log" name="reg-log" checked={checkbox} readOnly/>
			          	<label htmlFor="reg-log"></label>
						<div className="card-3d-wrap mx-auto">
							<div className={`card-3d-wrapper ${forgotPassword?"card-forget-pass":null}`}>							
							
								<div className="card-front">
									<form onSubmit={forgotPassword?forgotPasswordOnSubmit:(verify? verifyOnSubmit :loginOnSubmit) }>
									{verify?<EmailVerify otp={otp} setOtp={otp => setOtp(otp)} resendEmail = {resendEmail} ref={TimeOutRef}/>:
									<LoginCard username={username} setUsername={username => setUsername(username)} password={password} setPassword={password => setPassword(password)} email={email} setEmail={email => setEmail(email)} forgotPassword={forgotPassword} setForgotPassword = {forgotPassword=>setForgotPassword(forgotPassword)}/>}	
									</form>
			      				</div>
								<div className="card-back">
									<form onSubmit={resetPasswordConst?resetPasswordOnSubmit: signupOnSubmit}>
									{resetPasswordConst? <ResetPassword forgetPass1={forgetPass1} forgetPass2={forgetPass2} setforgetPass1={forgetPass1=>setforgetPass1(forgetPass1)} setforgetPass2={forgetPass2=>setforgetPass2(forgetPass2)}/>:
									<SignupCard username={username} setUsername={username => setUsername(username)} password={password} setPassword={password => setPassword(password)} email={email} setEmail={email => setEmail(email)} name={name} setName={name => setName(name)} />}									
									</form>
			      				</div>
			      			</div>
			      		</div>
			      	</div>
		      	</div>
	      	</div>
	    </div>
	</div>
	<CopyrightFooter />
        </div>
    )
}

export default LoginForm;