var https = require('https')
var auth = require('./auth.json')
var rsvp = require('rsvp')

var blacklist = [368,399,298,293,289,288];



function Board(boardId) {
  this.boardId = boardId
}



Board.prototype.getSprints = function() {
  var boardId = this.boardId
  var url = "https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/agile/1.0/board/"+boardId+"/sprint"

  var promise = new rsvp.Promise(function(resolve) {

    https.get(url, function(res) {
      var body = ''
      res.on('data', function(d) {
        body += d
      })
      res.on('end', function() {
        var sprints = JSON.parse(body)
        var startSprint = 244;
        var result = extractSprintsStartingAtId(sprints, startSprint)

        resolve(result)
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message)
    })

  })
  return promise
}



function extractSprintsStartingAtId(sprints, startSprint) {
  var result = []
  var values = sprints.values
  var arrayLength = values.length

  for (var i = 0; i < arrayLength; i++) {
    var blacklisted = 0
    for(var j = 0; j<blacklist.length; j++) {
      if(values[i].id==blacklist[j]) blacklisted = 1
    }
    if(values[i].id>=startSprint && values[i].state!='future' && !blacklisted) {
      result.push(values[i].id)
    }
  }

  return result
}



module.exports = Board