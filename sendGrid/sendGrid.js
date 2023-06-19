const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPmail = async (email, otp) => {

  const msg = {
    to: email,
    from: 'sherif.yasser1@msa.edu.eg',
    subject: 'noreply',
    html: `<p> Hi from GPT Clone <br> <br>
    Your OTP is <strong> ${otp} </strong>`,
  };
  await sgMail.send(msg);
}

module.exports = sendOTPmail;
