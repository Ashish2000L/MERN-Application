var SibApiV3Sdk = require("sib-api-v3-sdk");
var {EmailSendError} = require("./exception");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =process.env.SMTP_API;


const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

//testing emails using mailtrap
var fakeTransport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD
  }
});

const sendNodeMail = async(email,name,subject,body,fake=false)=>{
  const message = {
    from: '"no-reply" career@growthingly.com', 
    to: `"${name}" ${email}`,         
    subject: subject, 
    html: body
};

  if(!fake)
    {var info=await transport.sendMail(message);
    }else{
      var info = await fakeTransport.sendMail(message)
      console.log(info)
    }


  if (!info.messageId) {
    console.log(info)
    throw new EmailSendError("Failed to send Email!",422,"EmailFail")
  }else{
    console.log(info)
  }
}

const sendEmail= async(email,name,body)=> {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 
    sendSmtpEmail = {
      sender: { name:"Growthingly",email: process.env.EMAIL },
      to: [
        {
          email: email,
          name: name,
        },
      ],
      subject: "Test Email",
      textContent: "Test Email Content",
    };
    await apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: " + data);
      },
      function (error) {
        console.error(error);
        throw new EmailSendError("Failed to send Email!",422,"EmailFail")
      }
    );
  }

module.exports = {sendEmail,sendNodeMail};