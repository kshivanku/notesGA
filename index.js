const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;

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
    console.log(req.body.result.resolvedQuery);
    app.tell("note added");
  }

  function removeNote(app) {
    app.tell("note removed");
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent);
  actionMap.set('add.note', addNote);
  actionMap.set('remove.note', removeNote);
  app.handleRequest(actionMap);

})
