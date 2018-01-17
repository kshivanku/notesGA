var databaseFile = 'database/database.json';

$(document).ready(function(){
  $.getJSON(databaseFile, function(data){
    console.log(data);
  });
});
