var sortBy = require('sort-array')
var restify = require('restify')

var Board = require('./Board')
var Sprint = require('./Sprint')
var SprintDataExtractor = require('./SprintDataExtractor')
var EPPromise = require('./EPPromise')

var port = 3001
var sprintHistory = [];
var originalSort = [];



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
  sprintHistory = [];
  res.setHeader('Access-Control-Allow-Origin', '*');

  var board = new Board(boardId)
  board.getSprints(function() {
    res.json(sprintHistory);
  }).success(handleSprints);

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



function handleSprints(boardId, result, ready) {
  for(var i = 0; i < result.length; i++) {
    originalSort.push(result[i]);
    var sprint = new Sprint(boardId, result[i])
    sprint.getSprint(result.length).success(function(sprint, expectedSprintCount) {
      handleSprint(sprint, expectedSprintCount, ready);
    });
  }
}



function handleSprint(sprint, expectedSprintCount, ready) {

  sprintDataExtractor = new SprintDataExtractor()
  sprintHistory.push(sprintDataExtractor.extractData(sprint))
  if(sprintHistory.length == expectedSprintCount) {
    sortBy(sprintHistory, "id", { id: originalSort })
    ready()
  }

}
