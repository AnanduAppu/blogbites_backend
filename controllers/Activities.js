const userModel = require('../Schema/users')
const BlogModel = require('../Schema/blogs')
const { tryCatch } = require("../middlewares/trycatch");
const commentModel = require('../Schema/comments')
const notificationModel = require('../Schema/notification')


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

        await notificationModel.deleteOne({
          user: blogPost.author,
          fromUser: userId,
          type: "like",
          blog: blogid
        });
      } else {
        // If user hasn't liked, add the user ID to the likes array
        await BlogModel.updateOne({ _id: blogid }, { $push: { likes: existingUser._id } });
        await userModel.updateOne({ _id: userId }, { $push: { likedBlogs: blogPost._id } });

        const existingNotification = await notificationModel.findOne({
            user: blogPost.author,
            fromUser: userId,
            type: "like",
            blog: blogid
          });
      
          if (!existingNotification) {
            // Create a new notification if it does not exist
            const notification = new notificationModel({
              user: blogPost.author,  
              fromUser: userId,
              type: "like",
              message: `${existingUser.username} liked your post.`,
              blog: blogid
            });
            await notification.save();
          }
      }
  
      res.status(200).json({ 
        message: "Post liked",
        success: true,
       
      });
  
  });




  //save a blog
const Save_A_Blog = tryCatch(async (req, res) => {
    const { userId, blogid } = req.body;
  
    // Find the existing user
    const existingUser = await userModel.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
  
    // Find the blog post
    const blogPost = await BlogModel.findOne({ _id: blogid });
    if (!blogPost) {
      return res.status(400).json({
        message: "Blog post not found",
        success: false,
      });
    }
  
    console.log('we are in saved blogs', userId);
    // Check if the user's ID is already in the saved_blogs array
    const isSaved = existingUser.saved_blogs.includes(blogPost._id);
    console.log(existingUser);
    if (isSaved) {
      // If user already saved the blog, remove the blog ID from the saved_blogs array
      await userModel.updateOne({ _id: userId }, { $pull: { saved_blogs: blogPost._id } });
    } else {
      // If user hasn't saved the blog, add the blog ID to the saved_blogs array
      await userModel.updateOne({ _id: userId }, { $push: { saved_blogs: blogPost._id } });
    }
  
    res.status(200).json({
      message: "Blog saved status updated",
      success: true,
    });
  });


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

   const notification = new notificationModel({
    user: existBlog.author,
    fromUser: userId,
    type: "comment",
    message: `${existUser.username} commented on your post.`,
    blog: blogid
});
await notification.save();
  
   res.status(200).json({
    message:"you commented",
    success:true
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
        const userData= await userModel.findOne({_id:anotheruserId}).populate('your_blogs').populate('you_followed').populate('followed')

        await notificationModel.deleteOne({
          user: anotheruserId,
          fromUser: logeduserId,
          type: "follow",
          
        });
  
        res.status(200).json({
          message:"you unfollowed ",
          success:true,
          Data:userData
          
        })
      } else {
        // If user hasn't anotheruser follwed array, add the user ID to the follwed array
       
        await userModel.updateOne({ _id: anotheruserId }, { $push: { followed: existLogedUser._id } });
        await userModel.updateOne({ _id: logeduserId }, { $push: {you_followed: existAnotherUser._id } });
        const userData= await userModel.findOne({_id:anotheruserId}).populate('your_blogs').populate('you_followed').populate('followed')

        const notification = new notificationModel({
            user: anotheruserId,
            fromUser: logeduserId,
            type: "follow",
            message: `${existLogedUser.username} followed you.`
        });
        await notification.save();

        res.status(200).json({
          message:"you followed ",
          success:true,
          Data:userData
        })
      }
  
  });


  const displayNotification = tryCatch(async(req,res)=>{
   const userid = req.query.id;

  
   console.log(userid)
    // Find all notifications for the user, sorted by creation date in descending order
    const notifications = await notificationModel.find({user:userid})
        .populate('fromUser') 
        .populate('blog') 
        .sort({ createdAt: -1 }); // Sort by creation date, most recent first
        console.log(notifications)
    if (!notifications) {
        return res.status(404).json({
            message: "No notifications found",
            success: false
        });
    }

    res.status(200).json({
        message: "Notifications retrieved successfully",
        success: true,
        Data: notifications
    });

  })


  module.exports = {
    followAndUnfollow,
    like_A_Post,
    post_A_comment,
    Save_A_Blog,
    displayNotification
  };
  