var https = require('https')
var auth = require('./auth.json')
var rsvp = require('rsvp')

function JiraQuerry() {
}

JiraQuerry.prototype.doQuerry = function(querry) {
  var promise = new rsvp.Promise(function(resolve) {
    https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/api/2/search?jql="+querry, function(res) {
      var body = ''
      res.on('data', function(data) {
        body += data
      })
      res.on('end', function() {
        var querryResult = JSON.parse(body)
        resolve(querryResult)
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message)
    })
  })
  return promise
}

JiraQuerry.prototype.getSprintGoals = function(currentSprint) {
  var querry = "labels in(SprintGoal) AND Sprint = \"" + currentSprint + "\"&fields=key,summary"
  return this.doQuerry(querry)
}

module.exports = JiraQuerry
