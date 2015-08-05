var https = require('https')
var auth = require('./auth.json')



function Board(boardId) {
  this.boardId = boardId
}



Board.prototype.getSprints = function(callback, ready) {
  var boardId = this.boardId
  var url = "https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/agile/1.0/board/"+boardId+"/sprint"
  https.get(url, function(res) {
    var body = ''
    res.on('data', function(d) {
      body += d
    })
    res.on('end', function() {
      sprints = JSON.parse(body)
      callback(boardId, sprints, ready)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })
}



module.exports = Board;