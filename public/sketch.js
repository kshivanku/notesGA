var databaseFile = 'database/database.json';

$(document).ready(function(){
  $.getJSON(databaseFile, function(data){
    if(data.length > 0) {
      $('#notes_list').empty();
      for(var i = 0 ; i < data.length ; i++) {
        $('#notes_list').append('<div class = "newEntry"><p class = "content">' + data[i].content + '</p><p class = "source">' + data[i].source + " | " + data[i].date + '</p></div>');
      }
    }
  });
  $('#deleteAllBtn').click(function(){
    $('#notes_list').empty();
    $('#notes_list').append('<div class="newEntry"><p class="content">No note yet</p><p class="source">No Source</p></div>');
    $.get('/deleteAll', function(data){
      console.log(data);
    })
  })
});
