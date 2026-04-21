const mongoose = require('mongoose')

async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/?directConnection=true")

    console.log("Connected to DataBase")  
}

module.exports=connectDB
