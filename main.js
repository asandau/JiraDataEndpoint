var https = require('https')
var sortBy = require('sort-array');
var auth = require('./auth.json');
var sprintHistory = [];

function getSprints(boardId, callback) {
	https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/agile/1.0/board/"+boardId+"/sprint", function(res) {

		var body = '';
		res.on('data', function(d) {
			body += d;
		});
		res.on('end', function() {
			sprints = JSON.parse(body);
			callback(boardId, sprints);
		});
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}

function getSprintById(boardId, sprintId, expectedSprintCount, callback) {
	https.get("https://"+auth.username+":"+auth.password+"@epages.atlassian.net/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId="+boardId+"&sprintId="+sprintId, function(res) {

		var body = '';
		res.on('data', function(d) {
			body += d;
		});
		res.on('end', function() {
			sprint = JSON.parse(body);
			callback(sprint, expectedSprintCount);
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
		if(values[i].id>=startSprint && values[i].state!='future') {
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

function extractSprintData(sprint) {
	var SprintData = {
		id: sprint.sprint.id,
		sprintName: sprint.sprint.name,
		storyPoints: {
			promised: sprint.contents.allIssuesEstimateSum.text,
			leftOvers: sprint.contents.incompletedIssuesEstimateSum.text,
			pulled: 0
			//TODO get pulled storypoints
		}
	}
	return SprintData;
}

function handleSprints(boardId, sprints) {
	var startSprint = 244;
	var result = extractSprintsStartingAtId(sprints, startSprint);

	for(var i = 0; i < result.length; i++) {
		getSprintById(boardId, result[i], result.length, handleSprint);
	}
}

function handleSprint(sprint, expectedSprintCount) {
	sprintHistory.push(extractSprintData(sprint));
	if(sprintHistory.length == expectedSprintCount) {
		sortBy(sprintHistory, "id");
		console.log(sprintHistory);
	}
	
}

var boardId = 159;
getSprints(boardId, handleSprints);