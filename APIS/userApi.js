//create router to handle user api reqs
const exp = require("express")
const userApp = exp.Router()
const expressAsyncHandler = require('express-async-handler')


//import bcryptjs for password hashing
const bcryptjs = require('bcryptjs')

//import jsonwebtoken to create token
const jwt = require("jsonwebtoken")
require("dotenv").config()


//to extract body of request object
userApp.use(exp.json())

//Create REST API

//USER API ROUTES

//Create route to handle '/getusers' path
userApp.get('/getusers', expressAsyncHandler(async(request, response)=>{
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject")
    //get all users
    let users = await userCollectionObject.find().toArray()
    //send res
    response.send({message:"Users list", payload:users})
}));



//Create route to user login
userApp.post('/login', expressAsyncHandler(async(request, response)=>{
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject")
    //get user credentials obj from client
    let userCredObj = request.body
            //search for user by email
        let userOfDB = await userCollectionObject.findOne({email:userCredObj.email});
        //If email not existed
        if(userOfDB == null){
            response.send({message:"Invalid User"})
        }
        //If email existed
        else{
            //compare passwords
            let status = await bcryptjs.compare(userCredObj.password, userOfDB.password)
            //if passwords not matched
            if(status == false){
                response.send({message: "Invalid password"})
            }
            //if passwords are matched
            else{
                //create token
                let token = jwt.sign({email:userOfDB.email}, 'abcdef', {expiresIn:60/*sec*/})
                //send token
                response.send({message : "success", payload:token, userObj:userOfDB})
            }
        }

}))

//Create a route to 'create-user'
userApp.post('/create-user', expressAsyncHandler(async(request, response)=>{
    
    //get userCollection Object
    let userCollectionObject = request.app.get("userCollectionObject")
    //get userObj from client
    let newUserObj = request.body;
    //search for user by username
    let userOfDB = await userCollectionObject.findOne({email:newUserObj.email})
    //if user existed
    if(userOfDB !== null){
        response.send({message : "email has already taken..Plz choose another"})
    }
    //if user not existed
    else{
        //hash password
        let hashedPassword = await bcryptjs.hash(newUserObj.password, 6)
        //replace plain password with hashed password in newUserObj
        newUserObj.password = hashedPassword;
        //insert newUser
        await userCollectionObject.insertOne(newUserObj)
        //send response
        response.send({message: "New User created"})
    }

}))


//Create a route to modify user data
userApp.put('/update-user', expressAsyncHandler(async(request, response)=>{
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get userObj from client
    let newUserObj = request.body;
    await userCollectionObject.updateOne({email:newUserObj.name},{$set:{email:newUserObj.name,email:newUserObj.email,city:newUserObj.city}})
    response.send({message: "Updated!"})
}))

//Create a route to delete user by Id
userApp.delete('/remove-user/:id', expressAsyncHandler(async(request, response)=>{
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get email from url param
    let uname=request.params.name;
    //remove user
    await userCollectionObject.deleteOne({email:{$eq:uname}})
    response.send({message:"Deleted!"})
}))


//export userApp
module.exports = userApp;