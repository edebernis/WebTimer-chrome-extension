/* Javascript popup.js */
var intervalId;
var intervalDelay = 1000;
var backgroundPage;

intervalId = setInterval(updateDisplay, intervalDelay);


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#reset').addEventListener('click', ResetSiteList);
  document.querySelector('#see_all').addEventListener('click', SeeAll);
});

function updateDisplay () {
	backgroundPage = chrome.extension.getBackgroundPage();
	$("#current").html(backgroundPage.document.getElementById("current").innerHTML)
	$("#top_sites").html(backgroundPage.document.getElementById("top_sites").innerHTML);
	$("#reset").css("visibility","visible");
	$("#see_all").css("visibility","visible");
}


function ResetSiteList (e) {
	clearInterval(intervalId);
	$("#current").html("")
	$("#top_sites").html("");
	$("#reset").css("visibility","hidden");
	$("#see_all").css("visibility","hidden");
	backgroundPage.reset();
	intervalId = setInterval(updateDisplay, intervalDelay);
}

function SeeAll (e) {
	backgroundPage.seeAll();
}


