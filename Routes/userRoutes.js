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

router.route("/blogcreate").get(userControl.blogPost)





module.exports = router;