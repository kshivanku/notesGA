const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res){
  console.log('hook request');
  const app = new ApiAiApp({
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
