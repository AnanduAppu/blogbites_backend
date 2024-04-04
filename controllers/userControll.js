const userModel = require('../Schema/users')
const BlogModel = require('../Schema/blogs')
const { tryCatch } = require("../middleWares/trycatch");
const bycrypt =require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config/configure');


const generatedOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: config.email.auth,
  });

//*signup section
//when click signup this code will work for creating otp and send to your mail
const otpSignup= tryCatch(async(req,res)=>{
    console.log("annadu")
    const userEmail = req.body.email;

    console.log(userEmail)

    const existingUser = await userModel.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
  
    console.log("we are after existinguser")
    const verificationCode = generatedOtp();
  
  
    // Send the verification code to the user's email
    const otpToken = jwt.sign(verificationCode,process.env.secreteKey)
    console.log(userEmail)
    console.log(otpToken)
    const mailOptions = {
      from: config.email.auth.user,
      to: userEmail,
      subject: 'Signup - Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    };
    console.log("we are after mailOptions")
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Failed to send verification code');
      }
      res.cookie("Otptoken", otpToken); // Store the verification code in a cookie
      res.status(200).json({ message: 'OTP sent successfully', success: true });
    });
})


//verify the otp from email after signup , then creating user
const createUsers = tryCatch(async(req,res)=>{
 
    const userSave = await userModel.create(req.body);

  
    const emailToken = jwt.sign({mail:userSave.email},process.env.secreteKey)

    res.cookie("emailToken", emailToken); // Store the verification code in a cookie
    res.status(200).json({ message: "your account created", success: true });

})


// after creating user , user select his interested topic
const interestedTopic = tryCatch(async(req,res)=>{
  const {selectedInterests,email} = req.body


  const userData = await userModel.findOne({ email: email });
  if(!userData){
    return res.status(400).json({message:"user not find",success:true})
  }
  console.log(selectedInterests,email)
  await userModel.findOneAndUpdate(
    { email },
    { $push: { interest: { $each: selectedInterests } } },
    { new: true }
  );

 res.status(200).json({ message: "Interests added successfully", success: true });

})

//*signup section ends here



//*login section

// login user in login page
const loginUser = tryCatch(async(req,res)=>{
  const {email,password}=req.body


  const userData = await userModel.findOne({ email: email });
  if(!userData){
    return res.status(400).json({message:"user not find",success:false})
  }
  
  const passwordMatch = await bycrypt.compare(password, userData.password);

  console.log("we are in loginuser controller")
  if (!passwordMatch) {
    return res.status(400).json({ message: "Incorrect password", success: false });
  }

  const id = userData.email
  console.log(id)
  const aboutUser = jwt.sign({id},process.env.secreteKey)

  res.cookie("userToken", aboutUser); 


  res.status(200).json({message:"login successfull",success:true})
})


//login with google auth 
const AuthLogin = tryCatch(async(req,res)=>{
  const { Enteredemail } = req.body;

  const userData = await userModel.findOne({ email: Enteredemail });

  if (!userData) {
    return res.status(404).json({ message: "User not found", success: false });
  }


const id = userData.email
console.log(id)
const aboutUser = jwt.sign(id,process.env.secreteKey)

res.cookie("userToken", aboutUser); 


res.status(200).json({message:"login successfull",success:true})

})




// user forget password then he verify email to get otp
const emailverify = tryCatch(async(req,res)=>{
  console.log("hellow we are in email verification")
  const email=req.body.email
  const userData = await userModel.findOne({ email: email });
  if(!userData){
    return res.status(400).json({message:"user not find",success:true})
  }

  const verificationCode = generatedOtp();
  
  
  // Send the verification code to the user's email
    const otpToken = jwt.sign(verificationCode,process.env.secreteKey)

    console.log("your otp is :- ",verificationCode)
    const mailOptions = {
      from: config.email.auth.user,
      to:  email,
      subject: 'Forgot password',
      text: `Your verification code is: ${verificationCode}`,
    };
    console.log("we are after mailOptions")
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Failed to send verification code');
      }
      res.cookie("OtpPass", otpToken); // Store the verification code in a cookie
      res.status(200).json({ message: 'OTP sent successfully', success: true });
    });
})


//new password saving to backend
const setNewpassword = tryCatch(async(req,res)=>{

  const {userEmail,newPassword } = req.body;
console.log(userEmail)
  const hashedPassword = await bycrypt.hash(newPassword, 10);
  console.log(hashedPassword);
  const userEmailData = await userModel.findOne({email:userEmail})

if(!userEmailData){
  return res.status(400).json({
    message:"user not found",
    success:false
  })
}
console.log("we are completed user verification");

    await userModel.updateOne(
      { email: userEmail },
      { $set: { password: hashedPassword } }
      );

      console.log("we are here");

      res.status(200).json({ message: "password changed successful",success:true });
  
 
})

//profile image update
const AddImage = tryCatch(async(req,res)=>{

  const {email,imageUrl} = req.body
 
  const existingUser = await userModel.findOne({email:email});

  if(!existingUser  ){
    return res.status(400).json({
      message:"user not found",
      success:false
    })
  }
  
  existingUser.profilePicture = imageUrl;
  await existingUser.save();
 
  return res.status(200).json({
    message: "Profile picture updated successfully",
    success: true
  });

})


//send userdata when browser get reload 
const userAccess = tryCatch(async(req,res)=>{
  console.log("we are here")
  const Useremail  = req.body.email;
  console.log(Useremail)
  const existingUser = await userModel.findOne({email:Useremail});
  const token = req.cookies.userToken;

  console.log(token)

  if (!existingUser ) {
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }

  console.log(existingUser)
  res.status(200).json({
    Data: existingUser,
    successful: true
  });

})


//*social media activities

//like a post 
const likeaPost = tryCatch(async(req,res)=>{
  const {user,likedUser} = req.body

  const existingUser = await userModel.findOnefindOne({email:likedUser.email})
  const existingUser2 = await userModel.findOnefindOne({email:user.email})
  if(!existingUser2 && !existingUser  ){
    return res.status(400).json({
      message:"user not found",
      success:false
    })
  }

  const addLike = await userModel.updateOne({ _id: user._id }, { $push: { likes: likedUser._id } });

  const Likes = addLike.likes.length

  res.status(200).json({ message: "postLiked",success:true, totalLikes:Likes });

})


//comment a post
//save a post 


module.exports={
    otpSignup,
    createUsers,
    interestedTopic,
    AddImage,
    

    userAccess , //take data in every reload


    loginUser,
    AuthLogin,
    emailverify,
    setNewpassword
}