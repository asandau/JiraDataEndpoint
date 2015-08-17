var https = require('https')
var auth = require('./auth.json')
var rsvp = require('rsvp')



function Sprint(boardId, sprintId) {
  this.boardId = boardId
  this.sprintId = sprintId
}



Sprint.prototype.getSprint = function() {
  var url = "https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId="+this.boardId+"&sprintId="+this.sprintId
  var promise = new rsvp.Promise(function(resolve) {
    https.get(url, function(res) {
      var body = ''
      res.on('data', function(data) {
        body += data
      })
      res.on('end', function() {
        var sprint = JSON.parse(body)
        resolve(sprint)
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message)
    })
  })
  return promise
}



module.exports = Sprint
