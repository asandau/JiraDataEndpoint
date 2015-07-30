var https = require('https')
var sortBy = require('sort-array');
var restify = require('restify')
var auth = require('./auth.json');
var sprintHistory = [];
var originalSort = [];
var blacklist = [288];

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
	getSprints(boardId, handleSprints, function() {
		res.json(sprintHistory);
	});
	next();
});

var port = 3001
server.listen(port, function (err) {
    if (err) {
        console.error(err)
        return 1
    } else {
        return 0
    }
})

function getSprints(boardId, callback, ready) {

	https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/agile/1.0/board/"+boardId+"/sprint", function(res) {

		var body = '';
		res.on('data', function(d) {
			body += d;
		});
		res.on('end', function() {
			sprints = JSON.parse(body);
			callback(boardId, sprints, ready);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
}

function getSprintById(boardId, sprintId, expectedSprintCount, callback, ready) {
	https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId="+boardId+"&sprintId="+sprintId, function(res) {

		var body = '';
		res.on('data', function(d) {
			body += d;
		});
		res.on('end', function() {
			sprint = JSON.parse(body);
			callback(sprint, expectedSprintCount, ready);
		});
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}

function extractSprintsStartingAtId(sprints, startSprint) {
	var result = [];
	var arrayLength = sprints.maxResults;
	var values = sprints.values;

	for (var i = 0; i < arrayLength; i++) {
		var blacklisted = 0;
		
		for(var j = 0; j<blacklist.length; j++) {
			if(values[i].id==blacklist[j]) blacklisted = 1;
		}
		
		if(values[i].id>=startSprint && values[i].state!='future' && !blacklisted) {
			result.push(values[i].id);
		}
	}

	return result;
}

function extractActiveSprint(sprints) {
	var arrayLength = sprints.maxResults;
	var values = sprints.values;

	for (var i = 0; i < arrayLength; i++) {
		if(values[i].state=='active') {
			return values[i].id;
		}
	}
}

function extractPulledStoryPoints(sprint) {
	var addedDuringSprint = sprint.contents.issueKeysAddedDuringSprint;
	var issues = sprint.contents.completedIssues.concat(sprint.contents.incompletedIssues);
	
	var pulledStorypoints = 0;
	var keys = Object.keys(addedDuringSprint);
    for(var i=0; i<keys.length; i++){
		for(var j=0; j<issues.length; j++) {
			if(issues[j].key == keys[i]) {
				var value = issues[j].estimateStatistic.statFieldValue.value;
				if(value) {
					pulledStorypoints += value;	
				}
			}
		}
    }
	return pulledStorypoints;
}

function extractSprintData(sprint) {
	var pulledStoryPoint = extractPulledStoryPoints(sprint);
	var SprintData = {
		id: sprint.sprint.id,
		sprintName: sprint.sprint.name,
		storyPoints: {
			promised: sprint.contents.allIssuesEstimateSum.text - pulledStoryPoint,
			leftOvers: sprint.contents.incompletedIssuesEstimateSum.text,
			pulled: pulledStoryPoint
		}
	}
	return SprintData;
}

function handleSprints(boardId, sprints, ready) {
	var startSprint = 244;
	var result = extractSprintsStartingAtId(sprints, startSprint);

	for(var i = 0; i < result.length; i++) {
		originalSort.push(result[i]);
		getSprintById(boardId, result[i], result.length, handleSprint, ready);
	}
}

function handleSprint(sprint, expectedSprintCount, ready) {
	sprintHistory.push(extractSprintData(sprint));
	if(sprintHistory.length == expectedSprintCount) {
		sortBy(sprintHistory, "id", { id: originalSort });
		ready();
	}
	
}

