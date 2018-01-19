const express = require('express');
const bodyParser = require('body-parser');
const DialogflowApp = require('actions-on-google').DialogflowApp;
const fs = require('fs');
const moment = require('moment-timezone');
const youtubedl = require('youtube-dl');
const ytdl = require('ytdl-core');
const path  = require('path');
const https = require('https');

var databaseFile = "public/database/database.json";
var cameFromUnknown = false;
var cancelPhrase = "scratch note";
var splitPhrase = "quote ";

const restService = express();
restService.use(express.static("public"));
restService.use(bodyParser.json());
restService.use(bodyParser.urlencoded({extented: true}));
restService.listen((process.env.PORT || 5000), function() {
    console.log('server listening');
})

restService.post('/hook', function(req, res) {
    console.log('hook request');
    const app = new DialogflowApp({request: req, response: res});

    function welcomeIntent(app) {
        app.ask("Hi this is audio notes.");
    }

    function addNote(app) {
        var raw_content = req.body.result.resolvedQuery;
        if (cameFromUnknown) {
            cameFromUnknown = false;
            var note_content = raw_content;
        } else {
            var note_content = raw_content.split(splitPhrase)[1];
        }
        var database = JSON.parse(fs.readFileSync(databaseFile));
        if (database.length == 0) {
            database = new Array();
        }
        if (note_content) {
            if (note_content.indexOf(cancelPhrase) != -1) {
                app.setContext("addnote", 1);
                app.ask("ok try again, ready to add");
            } else {
                var newEntry = {
                    "source": "Google Assistant",
                    "date": getDate(),
                    "content": note_content
                }
                database.unshift(newEntry);
                fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
                app.ask('note added');
            }
        } else {
            app.setContext("addnote", 1);
            app.ask("ready to add");
        }
    }

    function removeNote(app) {
        var database = JSON.parse(fs.readFileSync(databaseFile));
        if (database.length > 0) {
            var removed_note = database.splice(0, 1);
            fs.writeFileSync(databaseFile, JSON.stringify(database));
        }
        app.ask("note removed");
    }

    function continueNote(app) {
        var raw_content = req.body.result.resolvedQuery;
        if (cameFromUnknown) {
            cameFromUnknown = false;
            var note_content = raw_content;
        } else {
            var note_content = raw_content.split(splitPhrase)[1];
        }
        var database = JSON.parse(fs.readFileSync(databaseFile));
        if (database.length > 0) {
            if (note_content) {
                if (note_content.indexOf(cancelPhrase) != -1) {
                    app.setContext("continuenote", 1);
                    app.ask("ok try again, ready to continue");
                } else {
                    var latest_note = database.splice(0, 1);
                    var newContent = latest_note[0].content + " " + note_content;
                    var newEntry = {
                        "source": "Google Assistant",
                        "date": getDate(),
                        "content": newContent
                    }
                    database.unshift(newEntry);
                    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
                    app.ask("note appended");
                }
            } else {
                app.setContext("continuenote", 1);
                app.ask("ready to continue");
            }
        }
    }

    function editNote(app) {
        var raw_content = req.body.result.resolvedQuery;
        if (cameFromUnknown) {
            cameFromUnknown = false;
            var note_content = raw_content;
        } else {
            var note_content = raw_content.split(splitPhrase)[1];
        }
        var database = JSON.parse(fs.readFileSync(databaseFile));
        if (database.length > 0) {
            var latest_note = database.splice(0, 1);
            if (note_content) {
                if (note_content.indexOf(cancelPhrase) != -1) {
                    app.setContext("editnote", 1);
                    app.ask("ok try again, ready to edit");
                } else {
                    var newEntry = {
                        "source": "Google Assistant",
                        "date": getDate(),
                        "content": note_content
                    }
                    database.unshift(newEntry);
                    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
                    app.ask("note edited");
                }
            } else {
                app.setContext("editnote", 1);
                app.ask("ready to edit");
            }
        }
    }

    function repeatNote(app) {
        var database = JSON.parse(fs.readFileSync(databaseFile));
        app.ask(database[0].content);
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

    function thankYou(app) {
        app.tell("Ok!");
    }

    function inputUnknown(app) {
        var contexts = req.body.result.contexts;
        var foundContext = false;
        for (var i = 0; i < contexts.length; i++) {
            if (contexts[i].name == 'addnote') {
                cameFromUnknown = true;
                foundContext = true;
                addNote(app);
                i = contexts.length;
            } else if (contexts[i].name == 'editnote') {
                cameFromUnknown = true;
                foundContext = true;
                editNote(app);
                i = contexts.length;
            } else if (contexts[i].name == 'continuenote') {
                cameFromUnknown = true;
                foundContext = true;
                continueNote(app);
                i = contexts.length;
            }
        }
        if (!foundContext) {
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

function getDate() {
    // var date = new Date();
    // date = date.toString();
    // date = date.split(" GMT")[0];
    // console.log(moment.tz.guess());
    // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
    var full_datetime = moment().tz("America/New_York").format();
    var date = full_datetime.split("T")[0];
    var timeArr = full_datetime.split("T")[1].split(":");
    var time = timeArr[0] + ":" + timeArr[1]
    var final_time = date + ", " + time;
    return final_time;
}

//CHROME EXTENSION STUFF

restService.post('/srtRequest', function(req, res) {
    var requestData = req.body;
    var ytLink = Object.keys(requestData);
    var videoYTid = requestData[ytLink[0]];
    var url = ytLink[0] + "=" + videoYTid;

    // var options = {
    // // Write automatic subtitle file (youtube only)
    // auto: true,
    // // Downloads all the available subtitles.
    // all: false,
    // // Languages of subtitles to download, separated by commas.
    // lang: 'en',
    // // The directory to save the downloaded files in.
    // cwd: 'public/videos'
    // };
    // youtubedl.getSubs(url, options, function(err, files) {
    //   if (err) throw err;
    //   console.log('subtitle files downloaded:', files);
    // });

    ytdl.getInfo(url, (err, info) => {
        if (err)
            throw err;
        var tracks = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
        if (tracks && tracks.length) {
            console.log('Found captions for', tracks.map(t => t.name.simpleText).join(', '));
            var track = tracks.find(t => t.languageCode === 'en');
            if (track) {
                console.log('Retrieving captions:', track.name.simpleText);
                console.log('URL', track.baseUrl);
                var output = `${info.title}.${track.languageCode}.xml`;
                console.log('Saving to', output);
                https.get(track.baseUrl, (res) => {
                    res.pipe(fs.createWriteStream(path.resolve('public/videos', output)));
                });

            } else {
                console.log('Could not find captions for', lang);

            }
        } else {
            console.log('No captions found for this video');
        }

    });

    responseData = {
        'txt': 'got your url ' + url
    }
    res.send(responseData);
})
