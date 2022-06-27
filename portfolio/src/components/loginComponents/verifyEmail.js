import React from "react";
import { useEffect} from "react";

const EmailVerify = React.forwardRef(({resendEmail,otp,setOtp},ref)=>{

    const filter = (data)=>{
		setOtp(data.replaceAll(/[^a-z0-9A-Z]/g,'').substring(0,6));
	}

    const formatTime = (time) =>
  `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
    time % 60
  ).padStart(2, "0")}`;  

  useEffect(()=>{
    console.log("called timeout function ",ref.current);
    if(!ref.current)
      ref.current=setTimeout(()=>{      
      if (document.getElementsByClassName('otp-resend')[0].classList.contains('disable'))
        document.getElementsByClassName('otp-resend')[0].classList.toggle('disable');
    },30000)
  });

    return (
                                    <div className="center-wrap">
										<div className="section text-center">
											<h4 className="mb-4 pb-3">Email Verification</h4>
											<div className="form-group">
												<input type="text" name="otp" className="form-style" placeholder="Your OTP" onChange={(e)=>filter(e.target.value)} value={otp || '' } autoComplete="off" />
												<i className="input-icon uil uil-envelope-lock"></i>
											</div>	
											<button className="btn mt-4" type="submit">submit</button>
                      
                            				<p className="mb-0 mt-4 text-center otp-resend disable"  ><span onClick={(e)=>{
                                      
                                      if (!document.getElementsByClassName('otp-resend')[0].classList.contains('disable'))
                                            {resendEmail(e);
                                              document.getElementsByClassName('otp-resend')[0].classList.toggle('disable');
                                            }

                                        ref.current=setTimeout(()=>{
      document.getElementsByClassName('otp-resend')[0].classList.toggle('disable')
      },300000);
      }} className="link">Resent OTP</span></p>
				      					</div>
                                          
			      					</div>
    )
});

export default EmailVerify;