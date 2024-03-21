const express = require('express');
const router = express();
const userControl = require('../controllers/userControll')

router.route("/signupOtp").post(userControl.otpSignup);
router.route("/usercreate").post(userControl.createUsers);
router.route("/userinterst").post(userControl.interestedTopic);

router.route("/userlogin").post(userControl.loginUser);
router.route("/authlogin").post(userControl.AuthLogin);
router.route("/varifyemail").post(userControl.emailverify);
router.route("/setnewpassword").post(userControl.setNewpassword);



module.exports = router;