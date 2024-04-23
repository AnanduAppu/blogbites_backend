const userModel = require('../Schema/users')
const BlogModel = require('../Schema/blogs')
const { tryCatch } = require("../middleWares/trycatch");
const bycrypt =require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config/configure');
const commentModel = require('../Schema/comments')


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
  console.log("we are in loginuser controller")

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


//logout the user 
const logOut = tryCatch(async (req, res) => {
 
  res.clearCookie("userToken")


  res.status(200).json({ message: 'Logout successful',success:true });
});

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
  const existingUser = await userModel.findOne({email:Useremail})
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


//edit userdata
const userEdit = tryCatch(async(req,res)=>{
  const {fullName,username,birthday,email,location,userid}=req.body

 const checkUser = await userModel.findOne({_id:userid})

 if (!checkUser) {
  return res.status(400).send("User does not exist");
}

  const updatedUser = await userModel.findByIdAndUpdate(
    userid,
    {
      $set: {
        firstName: fullName || checkUser.firstName,
        username: username || checkUser.username,
        email: email || checkUser.email,
        dob: birthday || checkUser.dob,
        region: location || checkUser.region
        
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Successfully edited",
    success: true
  });

})


//user background image change 
const walimage = tryCatch(async(req,res)=>{
  const {email,imageUrl} = req.body
 
  const existingUser = await userModel.findOne({email:email});

  if(!existingUser  ){
    return res.status(400).json({
      message:"user not found",
      success:false
    })
  }
  
  existingUser.backgroudWal = imageUrl;
  await existingUser.save();
 
  return res.status(200).json({
    message: "image updated successfully",
    success: true
  });
})

//posting the blog
const blogPost = tryCatch(async(req,res)=>{
  console.log("anandu")
  const {headline,blog,photo,email,selectedTopic}= req.body
console.log(req.body)
  const existingUser = await userModel.findOne({email:email});

  if (!existingUser ) {
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }

  const yourBlog = await BlogModel.create({
    author: existingUser._id,
    title:headline,
    description:blog,
    topic:selectedTopic,
    image:photo,
  })

  existingUser.your_blogs.push(yourBlog._id);
  await existingUser.save()
  
  res.status(200).json({successful:true,message:"blog created",data:yourBlog})
})




//list all blog posts
const blogListing = tryCatch(async(req,res)=>{
  const bloglist = await BlogModel.find().populate('author').populate("likes")

  res.status(200).json({
    blogs:bloglist,
    success:true
  })
})


//list all blogs of loged user
const userBlogListing = tryCatch(async(req,res)=>{

  const Useremail  = req.body.email;
  console.log(Useremail)
  const existingUser = await userModel.findOne({email:Useremail}).populate('your_blogs');


  if (!existingUser ) {
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }

  const myBlogs = existingUser.your_blogs


  res.status(200).json({
    blogdata:myBlogs,
    successful: true
  });
})


//loged user editing the blog
const editBlog = tryCatch(async(req,res)=>{
  const {imageEdit,headingEdit,descriptionEdit,blogid}=req.body

 const checkBlog = await BlogModel.findOne({_id:blogid})


 if (!checkBlog) {
  return res.status(400).send("blog not ready");
}

  const updatedblog = await BlogModel.findByIdAndUpdate(
    blogid,
    {
      $set: {
        title: headingEdit || checkUser.firstName,
        description: descriptionEdit || checkUser.username,
        image: imageEdit || checkUser.email,
        
        
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Successfully edited",
    success: true
  });
})

//*social media activities

//like a post 
const like_A_Post = tryCatch(async(req,res)=>{

  const {userId, blogid} = req.body;

    // Find the existing user
    const existingUser = await userModel.findOne({_id:userId});
    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }

    // Find the blog post
    const blogPost = await BlogModel.findOne({_id:blogid});
    if (!blogPost) {
      return res.status(400).json({
        message: "Blog post not found",
        success: false
      });
    }
   
    // Check if the user's ID is already in the likes array
    const isLiked = blogPost.likes.includes(existingUser._id);
    
    if (isLiked) {
      // If user already liked, remove the user ID from the likes array
      await BlogModel.updateOne({ _id: blogid }, { $pull: { likes: existingUser._id } });
      await userModel.updateOne({ _id: userId }, { $pull: { likedBlogs: blogPost._id } });
    } else {
      // If user hasn't liked, add the user ID to the likes array
      await BlogModel.updateOne({ _id: blogid }, { $push: { likes: existingUser._id } });
      await userModel.updateOne({ _id: userId }, { $push: { likedBlogs: blogPost._id } });
    }

    res.status(200).json({ 
      message: "Post liked",
      success: true,
     
    });

});


//loged user viewing his/her liked blog details
const LikedBlogUser = tryCatch(async(req,res)=>{

  const userid = req.headers.userid; // Retrieve userid from headers
  console.log("userid for liked blogs:", userid); // Log userid
  const existingUser = await userModel.findOne({ _id: userid }).populate("likedBlogs");

  if (!existingUser) {
      return res.status(404).json({
          message: "User not found",
          success: false
      });
  }

  const likedBlogs = existingUser.likedBlogs;

  res.status(200).json({
      success: true,
      data: likedBlogs
  });

})


//comment a post
const post_A_comment = tryCatch(async(req,res)=>{
  const {userId, blogid, comment} = req.body;
  console.log( req.body)
  const existUser = await userModel.findOne({_id:userId})
  const existBlog = await BlogModel.findOne({_id:blogid})


  if(!existUser || !existBlog){
    return res.status(400).json({
      message: "User or blog not found",
      success:false
    })
  }
 const addComment = await commentModel.create({
  whichBlog: blogid,
  commentPerson: userId,
  comment: comment,
 })

 existBlog.comments.push(addComment._id);

 await existBlog.save()

 res.status(200).json({
  message:"you commented",
  success:true
 })

})

//display the comments
const showComments = tryCatch(async(req,res)=>{
  const {blogid} = req.body;

  const existComments = await commentModel.find({ whichBlog: blogid }).populate("commentPerson");
 
  if(!existComments){
    return res.status(200).json({
      message:"no blog found",
      success:false
    })
  }

  res.status(200).json({
    message:"fetch all comments",
    success:true,
    commentData:existComments
  })
})


//follow another user
const followAndUnfollow = tryCatch(async(req,res)=>{
  
  //another user here logeduserId following
const {anotheruserId,logeduserId} = req.body

const existAnotherUser= await userModel.findOne({_id:anotheruserId})
const existLogedUser = await userModel.findOne({_id:logeduserId})


if(!existAnotherUser || !existLogedUser){
  return res.status(200).json({
    message:"user not exist"
  })
}

    // Check if the user's ID is already in the followed array
    const isfollowed = existAnotherUser.followed.includes(existLogedUser._id);

    
    if (isfollowed) {
      // If user already in anotheruser follwed array, remove the user ID to the follwed array
      await userModel.updateOne({ _id: anotheruserId }, { $pull: { followed: existLogedUser._id } });
      await userModel.updateOne({ _id: logeduserId }, { $pull: {you_followed: existAnotherUser._id } });

      res.status(200).json({
        message:"you unfollowed ",
        success:true
      })
    } else {
      // If user hasn't anotheruser follwed array, add the user ID to the follwed array
     
      await userModel.updateOne({ _id: anotheruserId }, { $push: { followed: existLogedUser._id } });
      await userModel.updateOne({ _id: logeduserId }, { $push: {you_followed: existAnotherUser._id } });
      res.status(200).json({
        message:"you followed ",
        success:true
      })
    }

})


//save a post 


module.exports={
    otpSignup,
    createUsers,
    interestedTopic,
    AddImage,
    

    userAccess , //take data in every reload
    userEdit,//edit user data
    editBlog,// edit out blog
    blogPost,//creating blog 
    blogListing,//to listing every blogs
    logOut,//user logout
    walimage,//background image update
    userBlogListing,// taking loged user blog data
    like_A_Post,// like and unlike a post
    post_A_comment,//post a new comment
    showComments,//show all comments of respective blog
    followAndUnfollow ,// follow and and unfollow a user
    LikedBlogUser,//viewing liked blogs


    loginUser,
    AuthLogin,
    emailverify,
    setNewpassword
}