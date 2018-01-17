const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;
const fs = require('fs');

var databaseFile = "public/database/database.json";
var cameFromUnknown = false;

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
    app.ask("Hi this is audio notes");
  }

  function addNote(app) {
    var raw_content = req.body.result.resolvedQuery;
    if(cameFromUnknown) {
      cameFromUnknown = false;
      var note_content = raw_content;
    }
    else {
      var note_content = raw_content.split("add a note ")[1];
    }
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if (database.length == 0) {
      database = new Array();
    }
    if(note_content){
      database.unshift(note_content);
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
      app.ask('note added: ' + note_content);
    }
    else {
      app.setContext("addNote", 1);
      app.ask("What note do you want to add?");
    }
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
    if(cameFromUnknown) {
      cameFromUnknown = false;
      var note_content = raw_content;
    }
    else {
      var note_content = raw_content.split("continue note ")[1];
    }
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if(database.length > 0) {
      if(note_content) {
        var latest_note = database.splice(0, 1);
        latest_note += " " + note_content;
        database.unshift(latest_note);
        fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
        app.ask("note changed to: " + latest_note);
      }
      else {
        app.setContext("continueNote", 1);
        app.ask("What do you want to add to the previous note?");
      }
    }
  }

  function editNote(app) {
    var raw_content = req.body.result.resolvedQuery;
    if(cameFromUnknown) {
      cameFromUnknown = false;
      var note_content = raw_content;
    }
    else {
      var note_content = raw_content.split("edit note ")[1];
    }
    var database = JSON.parse(fs.readFileSync(databaseFile));
    if(database.length > 0) {
      var latest_note = database.splice(0, 1);
      if(note_content) {
        database.unshift(note_content);
        fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
        app.ask("note edited: " + note_content);
      }
      else {
        app.setContext("editNote", 1);
        app.ask("What do you want to change the note to?");
      }
    }
  }

  function repeatNote(app) {
    var database = JSON.parse(fs.readFileSync(databaseFile));
    app.ask(database[0])
  }

  function deleteAll(app) {
    var database = JSON.parse(fs.readFileSync(databaseFile));
    var newDatabase = [];
    fs.writeFileSync(databaseFile, JSON.stringify(newDatabase, null, 2));
    app.ask("Deleted " + database.length + " notes");
  }

  function statusCheck(app) {
    var database = JSON.parse(fs.readFileSync(databaseFile));
    app.ask("There are " + database.length + " notes");
  }

  function thankYou(app){
    app.tell("Ok!");
  }

  function inputUnknown(app) {
    var contexts = req.body.result.contexts;
    var foundContext = false;
    console.log(contexts);
    for (var i = 0 ; i < contexts.length ; i++) {
      console.log(contexts[i].name);
      if(contexts[i].name == 'addNote') {
        cameFromUnknown = true;
        foundContext = true;
        addNote(app);
        break;
      }
      else if(contexts[i].name == 'editNote') {
        cameFromUnknown = true;
        foundContext = true;
        editNote(app);
        break;
      }
      else if(contexts[i].name == 'continueNote') {
        cameFromUnknown = true;
        foundContext = true;
        continueNote(app);
        break;
      }
    }
    if(!foundContext) {
      app.ask("Please say that again");
    }
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent);
  actionMap.set('add.note', addNote);
  actionMap.set('remove.note', removeNote);
  actionMap.set('continue.note', continueNote);
  actionMap.set('edit.note', editNote)
  actionMap.set('repeat.note', repeatNote);
  actionMap.set('delete.all', deleteAll);
  actionMap.set('status.check', statusCheck);
  actionMap.set('thank.you', thankYou);
  actionMap.set('input.unknown', inputUnknown);
  app.handleRequest(actionMap);

})
