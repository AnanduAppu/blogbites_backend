const express = require('express');
const router = express();
const userControl = require('../controllers/userControll')

router.route("/signupOtp").post(userControl.otpSignup);
router.route("/usercreate").post(userControl.createUsers);
router.route("/userinterst").post(userControl.interestedTopic);
router.route("/userimage").post(userControl.AddImage);


router.route("/userlogin").post(userControl.loginUser);
router.route("/authlogin").post(userControl.AuthLogin);
router.route("/varifyemail").post(userControl.emailverify);
router.route("/setnewpassword").post(userControl.setNewpassword);


router.route("/useraccess").post(userControl.userAccess);//user access in every reload , the data of loged in user will retrive from database in everytime
router.route("/userblogs").post(userControl.userBlogListing);//loged user blog details sending
router.route("/blogcreate").post(userControl.blogPost);// to creating or post a new blog
router.route("/bloglist").get(userControl.blogListing);// to list out all blogs
router.route("/logout").delete(userControl.logOut);//user log out the page
router.route("/edituser").put(userControl.userEdit);// edit user details
router.route("/updateWalimg").put(userControl.walimage);//update background image





module.exports = router;