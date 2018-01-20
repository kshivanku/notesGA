var databaseFile = 'database/database.json';

$(document).ready(function(){
  populateNotes();
  $('#deleteAllBtn').click(function(){
    // $('#notes_list').empty();
    // $('#notes_list').append('<div class="newEntry"><p class="content">No note yet</p><p class="source">No Source</p></div>');
    $.get('/deleteAll', deletionComplete)
  })
  $('body').on('click', '.delete_btn', function(){
    $.ajax({
      type: 'POST',
      url: 'https://audionotes.herokuapp.com/deleteOne',
      data: $(this)[0].id,
      success: deletionComplete,
      dataType: 'text'
    })
    // console.log($(this)[0].id);
  })
  function populateNotes(){
    $.getJSON(databaseFile, function(data){
      if(data.length > 0) {
        $('#notes_list').empty();
        for(var i = 0 ; i < data.length ; i++) {
          if(data[i].source == 'Chrome Extension') {
            $('#notes_list').append('<div class = "newEntry"><div class="text_area"><p class = "content">' + data[i].content + '</p><p class = "source">' + data[i].source + " | " + data[i].date + " | " + data[i].url + '</p></div><div id= "'+ data[i].content +'" class="delete_btn"></div></div>');
          }
          else if(data[i].source == 'Google Assistant') {
            $('#notes_list').append('<div class = "newEntry"><div class="text_area"><p class = "content">' + data[i].content + '</p><p class = "source">' + data[i].source + " | " + data[i].date + '</p></div><div id= "'+ data[i].content +'" class="delete_btn"></div></div>');
          }
          else {
            $('#notes_list').append('<div class = "newEntry"><div class="text_area"><p class = "content">' + data[i].content + '</p><p class = "source">' + data[i].source + " | " + data[i].date + '</p></div></div>');
          }
        }
      }
    });
  }
  function deletionComplete(data) {
    populateNotes();
  }
});
