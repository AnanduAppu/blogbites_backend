
const userAuth = (req,res)=>{
    const token = req.cookies.userToken;

    if(!token){
        res.status(401).send("Unauthorised Access");
    } else {

        return res.status(200).json({
            message: "successful authication",
            success: true
          });
      }
};

module.exports = {userAuth}