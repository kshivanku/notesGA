const express = require('express');
const bodyParser = require('body-parser');
const DialogFlowApp = require('actions-on-google').DialogFlowApp;

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res){
  console.log('hook request');
  const app = new DialogFlowApp({
    request : req,
    response : res
  });

  function welcomeIntent(app){
    console.log("inside welcomeIntent");
    app.ask("Hi this is welcome intent");
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent);

  restService.listen((process.env.PORT || 5000), function(){
    console.log('server listening');
  })

})
