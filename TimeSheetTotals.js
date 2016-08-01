var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var requests = require('request');
var rally = require('rally');
var queryUtils = rally.util.query;
var fs = require('fs');
var json2csv = require('json2csv');

var restApi = rally({
	apiKey: '_HSiq55uzTLKnoJO1qQTymYClsbsXS0Uhw8uGRME',
	requestOptions: {
    headers: {
      'X-RallyIntegrationName': 'My cool node.js program',
      'X-RallyIntegrationVendor': 'TrueBlue',
      'X-RallyIntegrationVersion': '1.0'
    }
  }
});

var bigStories = [];

function entireQuery() {
	restApi.query({
	    type: 'TimeEntryValue', //the type to query
	    start: 1, //the 1-based start index, defaults to 1
	    pageSize: 2, //the page size (1-200, defaults to 200)
	    limit: Infinity, //the maximum number of results to return- enables auto paging
	    //order: 'Rank', //how to sort the results
	    //fetch: ['Project', 'User', 'task', 'WorkProduct', 'WeekStartDate'],
	    fetch: ['TimeEntryItem', 'DateVal', 'LastUpdated ' ,'Hours', 'User', 'WorkProduct', 'FormattedID', 'Epic', 
	    'Project', 'Name', 'Parent', 'Projects', 'Defects', 'ProjectDisplayString', 'owner', 'c_Expenditure'],

	    ///user/49739083541 joel
	    ///user/51543502510 james
	    ///user/52289388759 david
	    /*
	    query: queryUtils.where('TimeEntryItem.Project', '=', '/project/50983112863').or('TimeEntryItem.Project', '=', '/project/50982923609')
	    .or('TimeEntryItem.Project', '=', '/project/49998887731').or('TimeEntryItem.Project', '=', '/project/50982925414')
	    .or('TimeEntryItem.Project', '=', '/project/50982926429').or('TimeEntryItem.Project', '=', '/project/55635571848')
	    .and('DateVal', '>=', '2016-05-07T00:00:00.000Z').and('DateVal', '<=', '2016-05-13T00:00:00.000Z'),
	    */
	    /*
	    query: queryUtils.where('TimeEntryItem.Project', '=', '/project/50983112863')
	    .and('DateVal', '>=', '2016-05-08T00:00:00.000Z').and('DateVal', '<=', '2016-05-15T00:00:00.000Z'),
	    */
	    query: queryUtils.where('TimeEntryItem.Project', '=', '/project/49211213851') //tbi development
	    .or('TimeEntryItem.Project', '=', '/project/56200604007') //prism dev
	    .or('TimeEntryItem.Project', '=', '/project/49998887731') //prism
	    .or('TimeEntryItem.Project', '=', '/project/50982925414') //info dev
	    .or('TimeEntryItem.Project', '=', '/project/50982923609') //core
	    .or('TimeEntryItem.Project', '=', '/project/50982926429') //finance
	    .or('TimeEntryItem.Project', '=', '/project/50983112863') //qwod
	    .or('TimeEntryItem.Project', '=', '/project/49211212319') //peoplesoft
	    .or('TimeEntryItem.Project', '=', '/project/49211213495') //ev5
	    .or('TimeEntryItem.Project', '=', '/project/55635571848') //db migration
	    .or('TimeEntryItem.Project', '=', '/project/49431743155') //scrum team 1
	    .or('TimeEntryItem.Project', '=', '/project/50402293352') //scrum team 9
	    .or('TimeEntryItem.Project', '=', '/project/50301126915') //swipejobs
	    .or('TimeEntryItem.Project', '=', '/project/51695968093') //Team 0
	    .or('TimeEntryItem.Project', '=', '/project/49211212038') //labpro
	    .or('TimeEntryItem.Project', '=', '/project/49211213320') //workday
	    .or('TimeEntryItem.Project', '=', '/project/50014229603') //data center consolidation
	    .or('TimeEntryItem.Project', '=', '/project/49211215929') //Team System Engineering
	    .or('TimeEntryItem.Project', '=', '/project/49211215121') //Team Network
	    .or('TimeEntryItem.Project', '=', '/project/49211213745') //tbi architecture
	    .or('TimeEntryItem.Project', '=', '/project/57673354287') //cicd team
	    .or('TimeEntryItem.Project', '=', '/project/57673349113') //CICD
	    .or('TimeEntryItem.Project', '=', '/project/49211212383') //rally
	    
	    
	    .and('DateVal', '>=', '2016-06-25T00:00:00.000Z').and('DateVal', '<=', '2016-07-22T00:00:00.000Z'),
	    //.and('TimeEntryItem.User', '=', '/user/51543502510'),
	    //.or('TimeEntryItem.User', '=', '/user/52289388759'),
	    
	    scope: {
	    	//project: '/project/50982925414' //info dev
	    	//project: '/project/50983112863' //qwod
	    	//project: '/project/50982923609' //core
	    	//project: '/project/49998887731' //prism
	    	//project: '/project/50982926429' //finance
	    	//project: '/project/55635571848' //db&migration
	    	project: '/project/49211210961', //alm project
	    	//workspace: '/workspace/48926045219',
	    	down: true,
	    },
	    requestOptions: {} //optional additional options to pass through to request
	}, function(error, result) {
	    if(error) {
	        console.log(error);
	    } else {
	        var fields = ['User', 'Project', 'Date', 'Hours', 'NameCombo', 'WorkProduct.c_Expenditure', 'EpicCombo', 'ThemeCombo', 
	        'Theme.c_Projects'];
	        var theResults = result.Results;
	        
	       	for (var i = 0; i <= theResults.length-1; i++) {
	        	bigStories.push(theResults[i]);
	        	bigStories[i].User = theResults[i].TimeEntryItem.User._refObjectName;
	        	bigStories[i].Date = theResults[i].DateVal.slice(0, 10);
	        	bigStories[i].Project = theResults[i].TimeEntryItem.Project.Name;

	        	if (theResults[i].TimeEntryItem.WorkProduct == null) {
	        		bigStories[i].WorkProduct = null;
	        	} else {
	        		bigStories[i].WorkProduct = theResults[i].TimeEntryItem.WorkProduct;
	        		bigStories[i].NameCombo = theResults[i].TimeEntryItem.WorkProduct.FormattedID + ' - ' 
	        		+ theResults[i].TimeEntryItem.WorkProduct.Name;
	        		if (theResults[i].WorkProduct.Epic == null) {
	        			bigStories[i].Epic = null;
	        		} else if (theResults[i].WorkProduct.Epic != null && theResults[i].WorkProduct.Epic.Parent == null) {
	        			bigStories[i].Theme = null;
	        			bigStories[i].EpicCombo = theResults[i].WorkProduct.Epic.FormattedID + ' - ' 
	        			+ bigStories[i].WorkProduct.Epic.Name;
	        			bigStories[i].Epic = theResults[i].WorkProduct.Epic;
	        		} else {
	        			bigStories[i].Epic = theResults[i].WorkProduct.Epic;
						bigStories[i].EpicCombo = theResults[i].WorkProduct.Epic.FormattedID + ' - ' 
	        			+ bigStories[i].WorkProduct.Epic.Name;
	        			bigStories[i].Theme = theResults[i].WorkProduct.Epic.Parent;
	        			bigStories[i].ThemeCombo = theResults[i].WorkProduct.Epic.Parent.FormattedID + ' - '
	        			+ theResults[i].WorkProduct.Epic.Parent.Name;
	        		}
	        	}
	        }
	        
	        var gotDate = new Date();
	        var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	        var gotDate1 = month[gotDate.getMonth()];
	        var gotDate2 = gotDate.getDate();
	        var gotDate3 = gotDate.getFullYear();
	        var gotDate4 = gotDate.getHours();
	        if (gotDate4 < 10) {
	        	gotDate4 = "0" + gotDate4;
	        }
	        var gotDate5 = gotDate.getMinutes();
	        if (gotDate5 < 10) {
	        	gotDate5 = "0" + gotDate5;
	        }
	        var theTimeStamp = gotDate3 + gotDate1 + gotDate2 + "-" +  gotDate4 + gotDate5;
	        console.log(theTimeStamp);
	        //console.log(bigStories[5]);

	        json2csv({data: bigStories, fields: fields}, function(err, csv) {
	        	if (err) console.log(err);
	        	fs.writeFile('FullTimeSheetTotals' + theTimeStamp + '.csv', csv, function(err) {
	        		if(err) throw err;
	        		console.log('file saved!');
	        	})
	        })
     
	    }
	});
};

entireQuery();

app.listen(3000, function() {
	console.log('server started');
});