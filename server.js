//Create express app
const exp = require('express')
const app = exp()
var cors = require('cors')
const mclient = require("mongodb").MongoClient

// require('dotenv').config()
app.use(cors())

//DB Connection URL
const DBurl = "mongodb+srv://vnr2022:vnr2022@shivacluster.zijeq.mongodb.net/?retryWrites=true&w=majority"

//connect with mongoDB server
mclient.connect(DBurl)
.then((client)=>{

    //get DB object
    let dbObj = client.db("NotesMaker")
    //Create collection objects
    let userCollectionObject = dbObj.collection("usercollection")
    let notesCollectionObject = dbObj.collection("notescollection")



    //Sharing collection objects to APIS
    app.set("userCollectionObject", userCollectionObject);
    app.set("notesCollectionObject", notesCollectionObject);

    
    console.log("DB connection success")
})
.catch(err=>console.log("Error in DB connection", err))


//import userApp and productApp
const userApp = require('./APIS/userApi')
const notesApp = require('./APIS/notesApi')

app.use('/user-api', userApp);
app.use('/notes-api', notesApp);

//dealing with page refresh
app.use('*', (request, response)=>{
    response.sendFile(path.join(__dirname, './build/index.html'))
})

//handling Invalid paths
app.use((request, response, next)=>{
    response.send({message: `path ${request.url} is invalid`})
})

//Error handling middleware
app.use((error, request, response, next)=>{
    response.send({message: "Error Occured", reason: `${error.message}`})
})

const port = process.env.PORT || 4000;
//assign port number
app.listen(port, ()=>console.log(`server listening on port ${port}...`))
