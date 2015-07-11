// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require angular
//= require_tree .


var app = angular.module("rcloudApp", []);

app.controller("MainCtrl", function ($scope) {
  $scope.greeting = "Hello World!";
});

// var MainCtrl = function() {
// }

// MainCtrl.prototype.search = function(query) {

// }

app.controller("SearchCtrl", function ($scope) {
  $scope.search = function(query) {
    console.log("submited");
    // Rdio Search
    // –––––––––––––––
    R.request({
      method: "search", 
      content: {
        query: query, 
        types: "Album", // changes to find artist, track, or album
        count: 10
      },
      success: function(response) {
        console.log("success");
        $scope.searchResults = response.result.results;    
      },
      error: function(response) {
        console.log("error");
        $(".error").text(response.message);
      }
    });
  };
});