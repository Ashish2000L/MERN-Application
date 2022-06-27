import { useState } from "react";

const ResetPassword = ({forgetPass1,forgetPass2,setforgetPass1,setforgetPass2})=>{

    const [passType, setPassType] = useState('password');

	const changeVisibility = ()=>{
		document.getElementsByClassName('eye-forgpass')[0].classList.toggle('d-none')
		document.getElementsByClassName('eye-slash-forgpass')[0].classList.toggle('d-none')
		passType === 'password'? setPassType('text'): setPassType('password');
	}

    const checkInput = (confpass)=>{

        if(forgetPass1!==null & confpass!==null & forgetPass1!=="" & confpass!==""){
            if(forgetPass1!==confpass){
                if(!document.getElementsByClassName('pass2')[0].classList.contains("form-warning"))
                    document.getElementsByClassName('pass2')[0].classList.add('form-warning')

                if(!document.getElementsByClassName('submit-pass')[0].classList.contains("disable"))
                    document.getElementsByClassName('submit-pass')[0].classList.add('disable')
            }

            if(forgetPass1===confpass)
                {document.getElementsByClassName("pass2")[0].classList.remove('form-warning')
                document.getElementsByClassName("submit-pass")[0].classList.remove('disable')
            }
        }else{
            document.getElementsByClassName("pass2")[0].classList.remove('form-warning')
            
            if(!document.getElementsByClassName('submit-pass')[0].classList.contains("disable"))
                    document.getElementsByClassName('submit-pass')[0].classList.add('disable')
        }

    }

    return(
        <div className="center-wrap">
        <div className="section text-center">
            <h4 className="mb-4 pb-3">Forget Password</h4>
            <div className="form-group pass1">
                <input type={passType} name="forgpass" className="pass-form-style" placeholder="New Password" id="forgpass" onChange={(e)=>{setforgetPass1(e.target.value)}} value={forgetPass1 || ''}  autoComplete="off" />
                <i className="input-icon uil uil-lock-alt"></i>
                <i className="visibility-icon eye-forgpass uil uil-eye" onClick={()=>changeVisibility()}></i>
                <i className="visibility-icon eye-slash-forgpass uil uil-eye-slash d-none " onClick={()=>changeVisibility( )}></i>
            </div>
            <div className="form-group mt-2 pass2">
                <input type="password" name="forgotforgetPass2" className="form-style" placeholder="Confirm password" id="forgPass2" onChange={(e)=>{setforgetPass2(e.target.value); checkInput(e.target.value);}} value={forgetPass2 || ''} autoComplete="off" />
                <i className="input-icon uil uil-lock"></i>
            </div>	
            <button type="submit" className="btn submit-pass mt-4">submit</button>
          </div>
      </div>
    )
}
export default ResetPassword;