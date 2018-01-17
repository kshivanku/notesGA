var databaseFile = 'database/database.json';

$(document).ready(function(){
  $.getJSON(databaseFile, function(data){
    for(var i = 0 ; i < data.length ; i++) {
      $('#container').append('<p>' + data[i] + '</p>');
    }
  });
});
