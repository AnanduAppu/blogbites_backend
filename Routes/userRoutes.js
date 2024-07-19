const express = require('express');
const router = express();
const userControl = require('../controllers/userControll')
const {userAuth} =require("../middlewares/userAuth")

router.route("/signupOtp").post(userControl.otpSignup);
router.route("/usercreate").post(userControl.createUsers);
router.route("/userinterst").post(userControl.interestedTopic);
router.route("/userimage").post(userControl.AddImage);
router.route("/defaultimg").get(userControl.defaultImage);

router.route("/userAuth").get(userAuth);
router.route("/userlogin").post(userControl.loginUser);
router.route("/authlogin").post(userControl.AuthLogin);
router.route("/varifyemail").post(userControl.emailverify);
router.route("/setnewpassword").post(userControl.setNewpassword);


router.route("/useraccess").get(userControl.userAccess);//user access in every reload , the data of loged in user will retrive from database in everytime
router.route("/userblogs").get(userControl.userBlogListing);//loged user blog details sending
router.route("/blogcreating").post(userControl.CreateblogPost);// to creating or post a new blog
router.route("/bloglist").get(userControl.blogListing);// to list out all blogs
router.route("/selectedBlog").get(userControl.selectedBlog);
router.route("/logout").delete(userControl.logOut);//user log out the page
router.route("/edituser").put(userControl.userEdit);// edit user details
router.route("/editBlog").put(userControl.editBlog);//edituser blog
router.route("/updateWalimg").put(userControl.walimage);//update background image
router.route("/like").put(userControl.like_A_Post);// add like and dislike same time
router.route("/likedblog").get(userControl.LikedBlogUser);// viewing liked bloged 
router.route("/savedblogs").get(userControl.SavedBlogUser);// viewing liked bloged 
router.route("/postcomment").post(userControl.post_A_comment);//post a comment
router.route("/showComment").post(userControl.showComments);// show all comment
router.route("/followAndunfollow").put(userControl.followAndUnfollow);//follow and unflow a user
router.route("/anotherUserProfile").get(userControl.fetchAnotherUser);// to view another user
router.route("/anotherUserBlogs").get(userControl.fetchAnotherUserBlogs);// to view another user blogs
router.route("/searchFriends").get(userControl.serachFriend);// search a friend
router.route("/saveBlog").put(userControl.Save_A_Blog);
router.route("/publicOrPrivate").post(userControl.isVisibility);
router.route("/deleteBlog").delete(userControl.deleteMyBlog);// deleting user blog if he want



module.exports = router;