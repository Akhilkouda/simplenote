//create router to handle note api reqs
const exp = require("express")
const notesApp = exp.Router()
const expressAsyncHandler = require('express-async-handler')
var cors = require('cors')

notesApp.use(cors())

notesApp.use(exp.json())

//Create route to handle '/getnotes' path
notesApp.get('/get-notes/:email', expressAsyncHandler(async(request, response)=>{
    //get noteCollectionObject
    let notesCollectionObject = request.app.get("notesCollectionObject")
    //get all notes
    let email = request.params.email;
    let user = await notesCollectionObject.findOne({email:email})
    response.send({message:"notes list", payload:user})
}));


//Create a route to 'create-note'
notesApp.post('/create-notes', expressAsyncHandler(async(request, response)=>{

    let notesCollectionObject = request.app.get("notesCollectionObject")
    //get noteObj from client
    let newNotes = request.body;
    console.log(newNotes)
    //search for note by notename
    let notesDB = await notesCollectionObject.findOne({email:newNotes.email})
    let notesObj;
    //if note existed
    if(notesDB !== null){
        notesObj = {...notesDB, notes: [...notesDB.notes, newNotes.notes]}
        await notesCollectionObject.updateOne({email:newNotes.email}, {$set:{...notesObj}})

    }
    //if note not existed
    else{
        notesObj = {email: newNotes.email, notes: [newNotes.notes]}
        let result = await notesCollectionObject.insertOne(notesObj)
    }
    //Send response
    response.send({message : 'Notes created successfully'})
}))

notesApp.delete('/remove-notes/:email/:title', expressAsyncHandler(async(request, response)=>{
    
    //get username from url param
    let uemail=request.params.email;
    let notes_title = request.params.title;

    //get userCollectionObject
    let notesCollectionObject = request.app.get("notesCollectionObject")
    let notesDB = await notesCollectionObject.findOne({email:uemail})
    let x = notesDB.notes.filter((note) => note.title !== notes_title)
    let res = await notesCollectionObject.updateOne({email: uemail}, {$set:{notes:x}});
    response.send({message: "succss", jj: res.body})
    console.log("FDkf", x)
console.log(uemail,notes_title)
}))


//to extract body of request object

module.exports = notesApp;