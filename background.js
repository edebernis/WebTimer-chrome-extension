/* Javascript background.js */

// Global vars
var siteList = [];
var intervalDelay = 1000;
var intervalId = setInterval(update, intervalDelay);
var currentTab;
var currentSite;
var newSiteWait = 2000; // milliseconds
var blacklist = ["newtab", "devtools", "chrome", "settings", "undefined"];
var nbTopToDisplay = 5;
var extensionId = chrome.i18n.getMessage("@@extension_id");
var isFocused = true;

// Add extensionId to blacklist
blacklist.push(extensionId);

// Class Site
function Site (name, favicon) {
	this.name = name;
	this.browsingTime = 0;
	this.favicon = favicon; // favicon url
	this.updateBrowsingTime = updateBrowsingTime;
}
function updateBrowsingTime () {
	this.browsingTime += intervalDelay;
}


function update () {
	updateSites();
	chrome.windows.getCurrent(function(browser){
		isFocused = browser.focused;
	})
	if (siteList != []) updateDisplay();
}


function updateSites () {
	if (!isFocused) return;

	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
		var tab = arrayOfTabs[0];
		
		// Set previous and current tabs
		var previousTabUrl = currentTab != undefined ? currentTab.url : '';
		currentTab = tab;
		
		// If the url tab change
		if (previousTabUrl != currentTab.url) {
			
			// Get corresponding site
			var siteName = getSiteNameFromUrl(currentTab.url);
			var site = getSiteByName(siteName);
			
			// Check blacklist
			if (isBlacklisted(siteName)) currentSite = undefined;
			// If undefined, add the site to the site list
			else if (site == undefined) addNewSite(currentTab, siteName);
			else currentSite = site;
		}		
		// update browsing time
		else if (currentSite != undefined) currentSite.updateBrowsingTime();
	});
}

function updateDisplay () {
	var topSitesList = '';
	var allSitesList = '';
	
	// Sort site list by decreasing order
	siteList.sort(compareSites);
	
	nbDisplay = Math.min(siteList.length, nbTopToDisplay);
	for (var i=0; i<siteList.length; ++i) {
		var site = siteList[i];
		cleanSiteList(site);
		var siteString = "<tr><td class='site_ranks'>"+(i+1)+".</td><td class='favicons'><img src=\""+site.favicon+"\" width='16' height='16' alt='favicon' /></td><td class='site_names'><a target='_blank' href='http://"+site.name+"'>"+site.name+"</a></td><td class='site_browsing_times'>"+millisecondsToTime(site.browsingTime)+"</td></tr>\r\n";
		if (i<nbDisplay) topSitesList += siteString;
		allSitesList += siteString
	}
	if (currentSite != undefined) {
		$("#current").html("<tr><td class='favicons'><img src=\""+currentSite.favicon+"\" width='16' height='16' alt='favicon' /></td><td class='site_names'><a target='_blank' href='http://"+currentSite.name+"'>"+currentSite.name+"</a></td><td class='site_browsing_times'>"+millisecondsToTime(currentSite.browsingTime)+"</td></tr>\r\n");
	}
	$('#top_sites').html(topSitesList);
	$('#all_sites').html(allSitesList);
}

function compareSites(site1, site2) {
	if (site1.browsingTime > site2.browsingTime) return -1;
	if (site1.browsingTime < site2.browsingTime) return 1;
	return 0;
}

function cleanSiteList(site) {
	if (site.browsingTime < newSiteWait && site != currentSite) {
		var index = siteList.indexOf(site);
		if (index != -1) siteList.splice(index, 1);
	}
}

function getSiteNameFromUrl(url) {
	return url.split('/')[2];
}

function addNewSite(tab, siteName) {

	clearInterval(intervalId);

	var url = tab.url ? tab.url.replace(/#.*$/, '') : '';
	var favicon;
	if (tab.favIconUrl && tab.favIconUrl != '' && tab.favIconUrl.indexOf('chrome://favicon/') == -1)
        // favicon appears to be a normal url
        favicon = tab.favIconUrl;
    else
        // couldn't obtain favicon as a normal url, try chrome://favicon/url
        favicon = 'chrome://favicon/' + url;

    setTimeout(function() {
    		var site = new Site(siteName, favicon)
            siteList.push(site);
            currentSite = site;
            intervalId = setInterval(update, intervalDelay);
        }, newSiteWait);
}

function isBlacklisted(siteName) {
	for (var i=0; i<blacklist.length; ++i) {
		if (siteName == blacklist[i]) return true;
	}
	return false;
}

function getSiteByName (name) {
	if (name == undefined) return undefined;
	
	for (var i=0; i<siteList.length; ++i) {
		var site = siteList[i];
		if (site.name == name) return site;
	}
	
	return undefined;
}

function millisecondsToTime(millisecs)
{
	var secs = Math.floor(millisecs / 1000);
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
   
    if (hours != 0)
    	return hours+" hours, "+minutes+" mins, "+seconds+" secs";
    else if (minutes != 0)
    	return minutes+" mins, "+seconds+" secs";
    else return seconds+" secs";
}

function reset() {
	clearInterval(intervalId);
	siteList = [];
	currentSite.browsingTime = 0;
	siteList.push(currentSite);
	updateDisplay();
	intervalId = setInterval(update, intervalDelay);
}

function seeAll() {
	chrome.tabs.create({url:"seeall.html"})
}
