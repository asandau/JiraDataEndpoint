var sortBy = require('sort-array')
var restify = require('restify')
var rsvp = require('rsvp')
var Board = require('./Board')
var JiraQuerry = require('./JiraQuerry')
var Sprint = require('./Sprint')
var SprintDataExtractor = require('./SprintDataExtractor')



var port = 3001

var server = restify.createServer()
server.use(restify.fullResponse())
server.use(restify.bodyParser({ mapParams: true }))

server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    return next()
  }
)

server.get("/jiradata/sprinthistory", function(req, res, next) {
  var boardId = 159;
  res.setHeader('Access-Control-Allow-Origin', '*');

  var board = new Board(boardId)
  board.getSprints().then(function(result) {
    handleSprints(boardId, result).then(function(sprintHistory) {
      res.json(sprintHistory);
    })
  })

  next();
});



server.listen(port, function (err) {
    if (err) {
        console.error(err)
        return 1
    } else {
        return 0
    }
})



function handleSprints(boardId, result) {
  var order = [];
  var sprintHistory = [];
  var promise = new rsvp.Promise(function(resolve) {

    for(var i = 0; i < result.length; i++) {
      order.push(result[i]);

      var sprint = new Sprint(boardId, result[i])
      sprint.getSprint().then(function(sprint) {
          sprintDataExtractor = new SprintDataExtractor()
          sprintHistory.push(sprintDataExtractor.extractData(sprint))
          if(sprintHistory.length == result.length) {
            sortBy(sprintHistory, "id", { id: order })
            jiraQuerry = new JiraQuerry()
            var currentSprintname = sprintHistory[result.length-1].sprintName
            jiraQuerry.getSprintGoals(currentSprintname).success( function(querryResult) {
              var sprintGoals = sprintDataExtractor.extractSprintGoals(querryResult);
              sprintHistory[result.length-1].sprintGoals = sprintGoals;
              resolve(sprintHistory)
            })

          }
      })
    }

  })
  return promise
}
