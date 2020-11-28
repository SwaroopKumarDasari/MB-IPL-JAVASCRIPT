let csvToJson = require('convert-csv-to-json');
 
let matchesJsonObj = csvToJson.fieldDelimiter(",").formatValueByType().getJsonFromCsv("matches.csv");
let deliveriesJsonObj = csvToJson.fieldDelimiter(",").formatValueByType().getJsonFromCsv("deliveries.csv");

printMatchesPerYear(matchesJsonObj);
printMatchesWonPerTeam(matchesJsonObj);
printExtraRunsPerTeam(matchesJsonObj, deliveriesJsonObj, 2016);
printSixesPerTeam2016(matchesJsonObj, deliveriesJsonObj, 2016);
printTopEconomicBowlers(matchesJsonObj, deliveriesJsonObj, 2015);

function printMatchesPerYear(matches){
    let numberOfMatchesPerYear = {};
    for (var eachMatch in matches){
        if (!numberOfMatchesPerYear.hasOwnProperty(matches[eachMatch].season))
            numberOfMatchesPerYear[matches[eachMatch]["season"]] = 1;
        else
            numberOfMatchesPerYear[matches[eachMatch]["season"]] += 1;
    }
  console.log(numberOfMatchesPerYear);
}

function printMatchesWonPerTeam(matches){
  let numberOfMatchesWonPerTeam = {};
  var tieCount = 0;
  for(var eachMatch in matches){
      if(numberOfMatchesWonPerTeam.hasOwnProperty(matches[eachMatch].winner)){
        numberOfMatchesWonPerTeam[matches[eachMatch].winner] += 1;
      }
      else{
        if(matches[eachMatch].winner == ''){
          numberOfMatchesWonPerTeam["Tied"] = tieCount+1;
          tieCount++;
        }
        else{
          numberOfMatchesWonPerTeam[matches[eachMatch].winner] = 1;
        }
      }
  }
  console.log(numberOfMatchesWonPerTeam);
}

function printExtraRunsPerTeam(matches, deliveries, year){
  let theExtrasCount2016PerTeam = {};

  let filtered2016Matches = filterMatches(matches, year);
  let matchIdLowerLimit = filtered2016Matches[0].id;
  let matchIdUpperLimit = filtered2016Matches[filtered2016Matches.length-1].id;
  let filtered2016Deliveries = filterDeliveries(deliveries,matchIdLowerLimit,matchIdUpperLimit);
  
  filtered2016Deliveries.forEach(eachDelivery => {
    if (theExtrasCount2016PerTeam.hasOwnProperty(eachDelivery["bowling_team"])) {
        let currentExtraRuns = (theExtrasCount2016PerTeam[eachDelivery["bowling_team"]]);
        theExtrasCount2016PerTeam[eachDelivery["bowling_team"]] = currentExtraRuns + (eachDelivery["extra_runs"]);
    } else {
        theExtrasCount2016PerTeam[eachDelivery["bowling_team"]] = (eachDelivery["extra_runs"]);
    }
  });
  console.log(theExtrasCount2016PerTeam);
}

function printTopEconomicBowlers(matches, deliveries, year){
  let topEconomicBowlers2015 = {};
  let runsConcededPerBowler = {};
  let ballsBowledPerBowler = {};

  let filtered2015Matches = filterMatches(matches, year);
  let matchIdLowerLimit = filtered2015Matches[0].id;
  let matchIdUpperLimit = filtered2015Matches[filtered2015Matches.length-1].id;
  let filtered2015Deliveries = filterDeliveries(deliveries,matchIdLowerLimit,matchIdUpperLimit);
  
  filtered2015Deliveries.forEach(eachDelivery => {
    if (eachDelivery["wide_runs"] > 0 || eachDelivery["noball_runs"] > 0) {
        if (runsConcededPerBowler.hasOwnProperty(eachDelivery["bowler"])) {
            let currentConcededRuns = (runsConcededPerBowler[eachDelivery["bowler"]]);
            runsConcededPerBowler[eachDelivery["bowler"]] = currentConcededRuns
                    + (eachDelivery["wide_runs"]) + (eachDelivery["noball_runs"]);
        } else {
            runsConcededPerBowler[eachDelivery["bowler"]] = eachDelivery["noball_runs"]
                    + eachDelivery["wide_runs"];
        }
    } else {
        let totalRunsPerBall = eachDelivery["batsman_runs"];
        if (runsConcededPerBowler.hasOwnProperty(eachDelivery["bowler"])) {
            let currentConcededRuns = runsConcededPerBowler[eachDelivery["bowler"]];
            runsConcededPerBowler[eachDelivery["bowler"]] = currentConcededRuns + totalRunsPerBall;
        } else {
            runsConcededPerBowler[eachDelivery["bowler"]] = totalRunsPerBall;
        }
        if (ballsBowledPerBowler.hasOwnProperty(eachDelivery["bowler"])) {
            let currentBallsBowled = ballsBowledPerBowler[eachDelivery["bowler"]];
            ballsBowledPerBowler[eachDelivery["bowler"]] = currentBallsBowled + 1;
        } else {
            ballsBowledPerBowler[eachDelivery["bowler"]] = 1;
        }
    }
  });
    Object.keys(runsConcededPerBowler).map(eachKey => {
        topEconomicBowlers2015[eachKey] = (runsConcededPerBowler[eachKey] * 6 / ballsBowledPerBowler[eachKey]);
    });
  console.log(sortProperties(topEconomicBowlers2015));
}

function printSixesPerTeam2016(matches, deliveries, year){
    let theSixes2016PerTeam = {}; 

    let filtered2016Matches = filterMatches(matches, year);
    let matchIdLowerLimit = filtered2016Matches[0].id;
    let matchIdUpperLimit = filtered2016Matches[filtered2016Matches.length-1].id;

    let filtered2016Deliveries = filterDeliveries(deliveries, matchIdLowerLimit, matchIdUpperLimit);
    filtered2016Deliveries.forEach(eachDelivery => {
        if(eachDelivery["total_runs"] == 6) {
            if (theSixes2016PerTeam.hasOwnProperty(eachDelivery["batting_team"])) {
                let currentSixes = theSixes2016PerTeam[eachDelivery["batting_team"]];
                theSixes2016PerTeam[eachDelivery["batting_team"]] = currentSixes + 1;
            } else
                theSixes2016PerTeam[eachDelivery["batting_team"]] = 1;
         }
      });
    console.log(theSixes2016PerTeam);
  }

function filterMatches(matches, year) {
  return matches.filter(eachMatchObj => (eachMatchObj.season == year))
}

function filterDeliveries(deliveries,from,to){
  return deliveries.filter(eachDelivery => (eachDelivery["match_id"])>=from && (eachDelivery["match_id"])<=to);
}

function sortProperties(obj)
{
  // convert object into array
  var sortable=[];
  let limit=0;
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]
	
	// sort items by value
	sortable.sort(function(a, b)
	{
	  return a[1]-b[1]; // compare numbers
  });
  
	return sortable.filter(eachObj => {
    if(limit<=10){
      limit++;
      return eachObj;
    }
  });
}


