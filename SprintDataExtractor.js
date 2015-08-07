


function SprintDataExtractor() {

}



SprintDataExtractor.prototype.extractData = function(sprint) {
  var pulledStoryPoint = extractPulledStoryPoints(sprint);
  var typeSums = extractTypeDistribution(sprint);
  var topics = extractDistribution(sprint);
  var SprintData = {
    id: sprint.sprint.id,
    sprintName: sprint.sprint.name,
    storyPoints: {
      promised: sprint.contents.allIssuesEstimateSum.text - pulledStoryPoint,
      leftOvers: sprint.contents.incompletedIssuesEstimateSum.text,
      pulled: pulledStoryPoint
    },
    typeDistribution: [
        {
          title: "Bug",
          storyPoints : typeSums["bugs"]
        },
        {
          title: "Task",
          storyPoints : typeSums["tasks"]
        },
        {
          title: "Story",
          storyPoints : typeSums["stories"]
        },
        {
          title: "Improvment",
          storyPoints : typeSums["improvements"]
        },
        {
          title: "Research",
          storyPoints : typeSums["research"]
        }
      ],
    topicDistribution: topics
  }
  return SprintData;
}



function extractPulledStoryPoints(sprint) {
  var addedDuringSprint = sprint.contents.issueKeysAddedDuringSprint;
  var issues = sprint.contents.completedIssues.concat(sprint.contents.incompletedIssues);
  
  var pulledStorypoints = 0;

  var keys = Object.keys(addedDuringSprint);
    for(var i=0; i<keys.length; i++) {
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



function extractTypeDistribution(sprint) {
  
  var typeSums = new Array();
  typeSums["bugs"] = 0;
  typeSums["tasks"] = 0;
  typeSums["improvements"] = 0;
  typeSums["stories"] = 0;
  typeSums["research"] = 0;
  
  var issues = sprint.contents.completedIssues.concat(sprint.contents.incompletedIssues);
  for(var i=0; i<issues.length; i++) {
    
    var storyType = issues[i].typeName;
    var value = issues[i].estimateStatistic.statFieldValue.value;
    
    switch(storyType) {
      case "Bug":
        typeSums["bugs"] += value;
        break;
      case "Story":
        typeSums["stories"] += value;
        break;
      case "Task":
        typeSums["tasks"] += value;
        break;
      case "Improvement":
        typeSums["improvements"] += value;
        break;
      case "Research":
        typeSums["research"] += value;
        break;
    }
  }
  
  return typeSums;
}

function extractDistribution(sprint) {
  
  var topics = {};
  
  var issues = sprint.contents.completedIssues.concat(sprint.contents.incompletedIssues);
  for(var i=0; i<issues.length; i++) {
    
    var epic = issues[i].epicField;
    var name = issues[i].summary;
    var storypoints = issues[i].estimateStatistic.statFieldValue.value;
    
    if(epic != undefined) {
      name = epic.text;
    }
    addToTopicsHash(topics, name, storypoints);

  }
  
  return topicsHashtoArray(topics);
}

function addToTopicsHash(topics, name, storypoints) {
  if(topics[name] == undefined) {
    topics[name] = storypoints;
  } else {
    topics[name] += storypoints;
  }
}

function topicsHashtoArray(topics) {
  var retval = [];
  for(var key in topics){
    retval.push({
					title: key,
					storyPoints : topics[key]
				});
  }
   return retval;
}

module.exports = SprintDataExtractor