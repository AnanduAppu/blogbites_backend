
const userAuth = (req,res,next)=>{
    const token = req.cookies.userToken;

    if(!token){
        res.status(401).send("Unauthorised Access");
    } else {

        next();
      }
};

module.exports = {userAuth}