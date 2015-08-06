var https = require('https')
var auth = require('./auth.json')



function Sprint(boardId, sprintId) {
  this.boardId = boardId
  this.sprintId = sprintId
}



Sprint.prototype.getSprint = function(callback, ready, expectedSprintCount) {
  https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId="+this.boardId+"&sprintId="+this.sprintId, function(res) {
    var body = ''
    res.on('data', function(data) {
      body += data
    })
    res.on('end', function() {
      var sprint = JSON.parse(body)
      callback(sprint, expectedSprintCount, ready)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })
}



module.exports = Sprint