const express = require('express');
const router = express();
const userActivity = require('../controllers/Activities')


router.route("/like").put(userActivity.like_A_Post);
router.route("/postcomment").post(userActivity.post_A_comment);
router.route("/followAndunfollow").post(userActivity.followAndUnfollow);
router.route("/saveBlog").put(userActivity.Save_A_Blog);
router.route("/display_notification").get(userActivity.displayNotification);


module.exports = router;