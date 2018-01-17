const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;
const fs = require('fs');

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
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if (database.length == 0) {
      database = new Array();
    }
    database.unshift(note_content);
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    app.ask('note added: ' + note_content);
  }

  function removeNote(app) {
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if(database.length > 0) {
      var removed_note = database.splice(0,1);
      fs.writeFileSync(databaseFile, JSON.stringify(database));
    }
    app.ask("note removed: " + removed_note);
  }

  function continueNote(app) {
    var raw_content = req.body.result.resolvedQuery;
    var note_content = raw_content.split("continue note ")[1];
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if(database.length > 0) {
      var latest_note = database.splice(0, 1);
      latest_note += note_content;
      database.unshift(latest_note);
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    }
    app.ask("note changed to: " + latest_note);
  }

  function editNote(app) {
    var raw_content = req.body.result.resolvedQuery;
    var note_content = raw_content.split("continue note ")[1];
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if(database.length > 0) {
      var latest_note = database.splice(0, 1);
      database.unshift(note_content);
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    }
    app.tell("edit note");
  }

  function repeatNote(app) {
    var database = JSON.parse(fs.readFileSync(databaseFile));
    app.ask(database[0])
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent);
  actionMap.set('add.note', addNote);
  actionMap.set('remove.note', removeNote);
  actionMap.set('continue.note', continueNote);
  actionMap.set('repeat.note', repeatNote)
  app.handleRequest(actionMap);

})
