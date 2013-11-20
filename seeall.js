/* Javascript seeall.js */
var backgroundPage;


$(function () {
	backgroundPage = chrome.extension.getBackgroundPage();
	$("#current").html(backgroundPage.document.getElementById("current").innerHTML)
	$("#all_sites").html(backgroundPage.document.getElementById("all_sites").innerHTML);
});