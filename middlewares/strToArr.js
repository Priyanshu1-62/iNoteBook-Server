const strToArr = (req, res, next)=>{
    let str=req.body.tag;
    if (typeof str !== "string") {
        return next();
    }
    req.body.tag=str.trim().split(/\s+/);
    next();
}

module.exports=strToArr;