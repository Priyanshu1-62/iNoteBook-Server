const strToArr = (req, res, next)=>{
    const str=req.body.tag;
    if (typeof str !== "string") {
        return next();
    }
    let curr="";
    let arr=[];
    for(let i=0;i<str.length;i++){
        if(str[i] !== ' '){
            curr+=str[i];
        }
        else{
            if(curr.length) arr.push(curr);
            curr="";
        }
    }
    if(curr.length) arr.push(curr);

    req.body.tag=arr;
    next();
}

module.exports=strToArr;