var https = require('https')
var auth = require('./auth.json')
var EPPromise = require('./EPPromise')

var blacklist = [288];



function Board(boardId) {
  this.boardId = boardId
}



Board.prototype.getSprints = function(ready) {
  var boardId = this.boardId
  var url = "https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/agile/1.0/board/"+boardId+"/sprint"
  
  epp = new EPPromise()

  https.get(url, function(res) {
    var body = ''
    res.on('data', function(d) {
      body += d
    })
    res.on('end', function() {
      var sprints = JSON.parse(body)
      var startSprint = 244;
      var result = extractSprintsStartingAtId(sprints, startSprint)
	  
      epp.getCallback().callback(boardId, result, ready)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })
  
  	return epp;
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