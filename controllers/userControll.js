const userModel = require('../Schema/users')
const BlogModel = require('../Schema/blogs')
const { tryCatch } = require("../middlewares/trycatch");
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
      res.cookie("Otptoken", otpToken,{
        httpOnly: true,
        secure: 'production',
        sameSite:  'None' ,
        maxAge: 24 * 60 * 60 * 1000 
    
      }); // Store the verification code in a cookie
      res.status(200).json({ message: 'OTP sent successfully', success: true });
    });
})


//verify the otp from email after signup , then creating user
const createUsers = tryCatch(async(req,res)=>{


  const { userDataFromSignup, otp } = req.body;


console.log(userDataFromSignup)
  // Retrieve token from cookies
  const token = req.cookies.Otptoken;

  if (!token) {
    return res.status(400).json({ message: "OTP token not found", success: false });
  }


    // Verify JWT token
    const decoded = jwt.verify(token, process.env.secreteKey);

    // Check if the provided OTP matches the decoded OTP
    if (otp === decoded) {
      // Create user
      const userSave = await userModel.create(userDataFromSignup);

      // Generate email token for further verification
      const emailToken = jwt.sign({ mail: userSave.email }, process.env.secreteKey, {
        expiresIn: '1d', // 1 day expiration
      });

      // Set the email token in a cookie
      res.cookie("emailToken", emailToken, {
        httpOnly: true,
        secure: 'production', 
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000, 
      });

      return res.status(200).json({ message: "Your account was created", success: true });
    } else {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }
  

})


// after creating user , user select his interested topic
const interestedTopic = tryCatch(async(req,res)=>{
  const {selectedInterests} = req.body

  const token = req.cookies.emailToken;
  const decoded = jwt.verify(token, process.env.secreteKey);
  const email = decoded.mail;

  const userData = await userModel.findOne({ email: email });
  if(!userData){
    return res.status(400).json({message:"user not find",success:true})
  }

  await userModel.findOneAndUpdate(
    { email },
    { $push: { interest: { $each: selectedInterests } } },
    { new: true }
  );

 res.status(200).json({ message: "Interests added successfully", success: true });

})



//default profile image 
const defaultImage = tryCatch(async(req,res)=>{



  
  const id = "6645c32e3bd65005c33f38e5"
  // Now you can perform operations on the "Defaultimg" collection


  const dataimg = await userModel.findById(id);

  if (!dataimg) {
    return res.status(400).json({
      success:false,
      messgae:"Data retrieval failed"
    })
  }
  console.log( dataimg)
 res.status(200).json({
    success:true,
    Data:dataimg
  })
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


  if (!passwordMatch) {
    return res.status(400).json({ message: "Incorrect password", success: false });
  }

  const id = userData.email

  const aboutUser = jwt.sign({id},process.env.secreteKey,{
    expiresIn: '1d'
  })

  res.cookie("userToken", aboutUser, {
    httpOnly: true,
    secure: 'production',
    sameSite:  'None' ,
    maxAge: 24 * 60 * 60 * 1000 

  }); 


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
  const aboutUser = jwt.sign({id},process.env.secreteKey,{
    expiresIn: '1d'
  })

  res.cookie("userToken", aboutUser, {
    httpOnly: true,
    secure: 'production',
    sameSite:  'None' ,
    maxAge: 24 * 60 * 60 * 1000 

  });


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
      res.cookie("OtpPass", otpToken,{
        httpOnly: true,
        secure: 'production',
        sameSite:  'None' ,
        maxAge: 24 * 60 * 60 * 1000 
    
      }); // Store the verification code in a cookie
      res.status(200).json({ message: 'OTP sent successfully', success: true });
    });
})


const verifyOtpforResetPassword=tryCatch(async(req,res)=>{
  const { otpinput } = req.body;
  const token = req.cookies.OtpPass;
  const decoded = jwt.verify(token, process.env.secreteKey);

  if (otpinput !== decoded) {
    return res.status(400).json({ message: "OTP verification failed", success: false });
  }
  res.clearCookie("OtpPass",{
    httpOnly: true,
    secure: 'production',
    sameSite:  'None' 
  
  })


  res.status(200).json({ message: "OTP successfully verified", success: true });
 
})

//new password saving to backend
const setNewpassword = tryCatch(async(req,res)=>{

  const {userEmail,newPassword } = req.body;

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

     
      res.status(200).json({ message: "password changed successful",success:true });
  
 
})


//logout the user 
const logOut = tryCatch(async (req, res) => {
 
  res.clearCookie("userToken",{
    httpOnly: true,
    secure: 'production',
    sameSite:  'None' 
  
  })

  res.status(200).json({ message: 'Logout successful',success:true });
});

//profile image update
const AddImage = tryCatch(async(req,res)=>{

  const {imageUrl} = req.body
 
  const token = req.cookies.emailToken;
  const decoded = jwt.verify(token, process.env.secreteKey);
  const email = decoded.mail;


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

  //const Useremail  = req.body.email;

  const token = req.cookies.userToken;
  const decoded = jwt.verify(token, process.env.secreteKey);
  const Useremail = decoded.id;

  const existingUser = await userModel
  .findOne({ email: Useremail })
  .populate('you_followed')
  .populate('followed');




  if (!existingUser ) {
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }


  res.status(200).json({
    Data: existingUser,
    successful: true
  });

})


//edit userdata
const userEdit = tryCatch(async(req,res)=>{
  const {fullName,username,birthday,location,userid}=req.body

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
const CreateblogPost = tryCatch(async (req, res) => {


  const { headline, blog, photo, email, selectedTopic,subParagraph1,subParagraph2 } = req.body;


    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      console.log("Unauthorized access attempt with email:", email);
      return res.status(401).json({ successful: false, error: "Unauthorized" });
    }
 
    const yourBlog = await BlogModel.create({
      author: existingUser._id,
      title: headline,
      description: blog,
      topic: selectedTopic,
      image: photo,
      descriptionPara1:subParagraph1,
      descriptionPara2:subParagraph2,
      visibility:true
    });
    
    existingUser.your_blogs.push(yourBlog._id);
    await existingUser.save();

    res.status(200).json({ success: true, message: "Blog created", data: yourBlog });
  
});






//list all blog posts

const blogListing = tryCatch(async (req, res) => {
  const topic = req.query.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  let bloglist;

  if (topic === 'all') {
    bloglist = await BlogModel.find({ visibility: true })
      .populate('author')
      .populate('likes')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  } else {
    let top = topic.toLowerCase();

    bloglist = await BlogModel.find({ topic: new RegExp(`^${top}$`, 'i'), visibility: true })
      .populate('author')
      .populate('likes')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  const result = bloglist

  res.status(200).json({
    blogs: result,
    success: true,
    page: page,
    limit: limit
  });
});



// showing particular blog which we reading 
const selectedBlog = tryCatch(async(req,res)=>{


  const BlogId = req.query.blogId;
  
 
  const existingBlog = await BlogModel.findOne({_id:BlogId}).populate('author').populate('likes')


  if (! existingBlog) {
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }
  

  res.status(200).json({
    blogdata:existingBlog,
    successful: true
  });
})


//list all blogs of loged user
const userBlogListing = tryCatch(async(req,res)=>{

  const token = req.cookies.userToken;
  const decoded = jwt.verify(token, process.env.secreteKey);
  const Useremail = decoded.id;
  
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
const editBlog = tryCatch(async (req, res) => {
  const { imageEdit, headingEdit, descriptionEdit, blogid, descriptionEdit1, descriptionEdit2 } = req.body;

  const checkBlog = await BlogModel.findOne({ _id: blogid });

  if (!checkBlog) {
    return res.status(400).send("Blog not found");
  }

  const updatedBlog = await BlogModel.findByIdAndUpdate(
    blogid,
    {
      $set: {
        title: headingEdit || checkBlog.title,
        description: descriptionEdit || checkBlog.description,
        image: imageEdit || checkBlog.image,
        descriptionPara1: descriptionEdit1 !== undefined ? descriptionEdit1 : (checkBlog.descriptionPara1 || ''),
        descriptionPara2: descriptionEdit2 !== undefined ? descriptionEdit2 : (checkBlog.descriptionPara2 || '')
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Successfully edited",
    success: true
  });
});



//loged user deleting his blog
const deleteMyBlog = tryCatch(async(req,res)=>{
  const {blogid,userId}=req.body

 const checkBlog = await BlogModel.findOne({_id:blogid})
const existingUser = await userModel.findOne({_id:userId})

 if (!checkBlog ) {
  return res.status(400).send("blog not found");
}
if (!existingUser ) {
  return res.status(400).send("user not found");
}

await BlogModel.deleteOne({ _id: blogid });
await userModel.updateOne({ _id: userId }, { $pull: {  your_blogs: blogid } });


  res.status(200).json({
    message: "Successfully deleted",
    success: true
  });
})



//user making his blog public/private
const isVisibility = tryCatch(async(req,res)=>{

  const {userId,blogid,isPublic}=req.body
  const checkBlog = await BlogModel.findOne({_id:blogid})
  const existingUser = await userModel.findOne({_id:userId})

  if (!checkBlog ) {
    return res.status(400).send("blog not found");
  }
  if (!existingUser ) {
    return res.status(400).send("user not found");
  }

    checkBlog.visibility = !isPublic;


    await checkBlog.save();

    res.status(200).json({
  
      success: true,
      visbility: checkBlog.visibility 
    });

})


//*social media activities

//Search a friend 

const serachFriend = tryCatch(async(req,res)=>{
  const searchTerm = req.query.q;

  // Validate search term
  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  // Assuming you have a Friend model with a `name` field
  const friends = await userModel.find({ 
    username: { $regex: searchTerm, $options: 'i' } // Case insensitive search
  });

  res.status(200).json({friends})
})



//loged user viewing his/her liked blog details
const LikedBlogUser = tryCatch(async(req,res)=>{

 
  const token = req.cookies.userToken;
  const decoded = jwt.verify(token, process.env.secreteKey);
  const Useremail = decoded.id; // Retrieve userid from headers

  const existingUser = await userModel.findOne({email:Useremail}).populate('likedBlogs').populate('saved_blogs');;

  if (!existingUser) {
      return res.status(404).json({
          message: "User not found",
          success: false
      });
  }

  const likedBlogs = existingUser.likedBlogs;
  const savedBlogs = existingUser.saved_blogs;



  res.status(200).json({
      success: true,
      LData: likedBlogs,
      SData: savedBlogs

  });

})


const SavedBlogUser = tryCatch(async(req,res)=>{

  const Useremail = req.query.q; // Retrieve userid from headers

  const existingUser = await userModel.findOne({email:Useremail}).populate('saved_blogs');

  if (!existingUser) {
      return res.status(404).json({
          message: "User not found",
          success: false
      });
  }

  const savedBlogs = existingUser.saved_blogs;



  res.status(200).json({
      success: true,
      Data: savedBlogs

  });

})



//accesing the saved blogs
const SavedBlogListing = tryCatch(async(req,res)=>{

  const userid = req.query.q; // Retrieve userid from headers
  console.log("userid for liked blogs:", userid); // Log userid
  const existingUser = await userModel.findOne({ _id: userid }).populate("saved_blogs");

  if (!existingUser) {
      return res.status(404).json({
          message: "User not found",
          success: false
      });
  }

  const savedBlogs = existingUser.saved_blogs;

  

  res.status(200).json({
      success: true,
      Data: savedBlogs

  });

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




//take another user profile 
const fetchAnotherUser = tryCatch(async(req,res)=>{

  const userid = req.query.id;

const existUser = await userModel.findOne({_id:userid}).populate('you_followed').populate('followed')

if(!existUser){
  return res.status(200).json({
    message:"user not exist"
  })
}

res.status(200).json({
  success:true,
  Data:existUser,
 
})
})


// fetch another user blogs

const fetchAnotherUserBlogs = tryCatch(async(req,res)=>{

const userid = req.query.id;



const existUser = await userModel.findOne({_id:userid})
const UserBlogs = await BlogModel.find({author:userid,visibility: true}).populate('likes')
if(!existUser){
  return res.status(200).json({
    message:"user not exist"
  })
};



res.status(200).json({
  success:true,
  Data:UserBlogs,
 
})
})


//save a post 


module.exports={
    otpSignup,
    createUsers,
    interestedTopic,
    AddImage,
    defaultImage,
    verifyOtpforResetPassword,

    userAccess , //take data in every reload
    userEdit,//edit user data
    editBlog,// edit out blog
    CreateblogPost,//creating blog 
    blogListing,//to listing every blogs
    logOut,//user logout
    walimage,//background image update
    userBlogListing,// taking loged user blog data
    selectedBlog,// viewing particular blog 


    showComments,//show all comments of respective blog

    LikedBlogUser,//viewing liked blogs
    SavedBlogUser,//viewing saved blogs
    fetchAnotherUser,// taking data of another users
    fetchAnotherUserBlogs,// takw another user blogs
    serachFriend,//search friends

    SavedBlogListing,//saved blog listing
    isVisibility ,// making your public/private
    deleteMyBlog,// delete the blog from user profile



    loginUser,
    AuthLogin,
    emailverify,
    setNewpassword
}