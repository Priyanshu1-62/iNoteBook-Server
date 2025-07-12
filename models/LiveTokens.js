const mongoose = require('mongoose')
const { Schema } = mongoose;

const tokenSchema=new Schema({
    token:{
        type: String
    }
})

module.exports=mongoose.model('LiveTokens', tokenSchema);