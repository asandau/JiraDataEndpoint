var https = require('https')
var auth = require('./auth.json')
var EPPromise = require('./EPPromise')


function Sprint(boardId, sprintId) {
  this.boardId = boardId
  this.sprintId = sprintId
}



Sprint.prototype.getSprint = function() {

  epp = new EPPromise();
  https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId="+this.boardId+"&sprintId="+this.sprintId, function(res) {
    var body = ''
    res.on('data', function(data) {
      body += data
    })
    res.on('end', function() {
      var sprint = JSON.parse(body)
      epp.getCallback().callback(sprint)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })
  return epp;
}



module.exports = Sprint