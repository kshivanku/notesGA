const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;

var databaseFile = "public/database/database.json";

const restService = express();
restService.use(bodyParser.json());
restService.listen((process.env.PORT || 5000), function(){
  console.log('server listening');
})

restService.post('/hook', function(req, res){
  console.log('hook request');
  const app = new DialogflowApp({
    request : req,
    response : res
  });

  function welcomeIntent(app){
    console.log("inside welcomeIntent");
    app.ask("Hi this is welcome intent");
  }

  function addNote(app) {
    var raw_content = req.body.result.resolvedQuery;
    var note_content = raw_content.split("add a note ")[1];
    console.log('raw_content: ', raw_content);
    console.log('note_content: ', note_content);
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if (database.length == 0) {
      database = new Array();
    }
    database.unshift(note_content);
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    app.ask('note added: ' + note_content);
  }

  function removeNote(app) {
    app.tell("note removed");
  }

  function continueNote(app) {
    app.tell("continue note");
  }

  function editNote(app) {
    app.tell("edit note");
  }

  function repeatNote(app) {
    app.tell("here is your last note");
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent);
  actionMap.set('add.note', addNote);
  actionMap.set('remove.note', removeNote);
  actionMap.set('continue.note', continueNote);
  actionMap.set('repeat.note', repeatNote)
  app.handleRequest(actionMap);

})
