var app = angular.module("rcloudApp", ["ngRoute"]);

app.controller("MainCtrl", ["$scope", "$http", "$interval", function ($scope, $http, $interval) {
  $scope.currentUser = null;
  $scope.userLibrary = [];

  // Initialize
  // –––––––––––––––––––––––––––––––––
  var init = function () {
    R.ready(function() {

      // load their library if connected
      if (R.authenticated() && getCookie("accessToken")) {
        console.log("authenticated")
        $scope.getLibrary()
      } else { 
        // load top tracks if user isn't connected 
        R.request({
          method: "getTopCharts", 
          content: {
            type: "Track"
          },
          success: function(response) {
            // add returned tracks to library 
            var tracks = response.result;
            $scope.$apply(function(){
              for(var i=0; i<tracks.length; i++ ) {  
                var track = tracks[i];
                var rcloudTrack = setRdioTrack(track);
                $scope.userLibrary.push(rcloudTrack);
              }

              // set first track in queue and update nowPlaying
              rcloud.queue.push($scope.userLibrary[0]);
              $scope.nowPlaying = rcloud.queue[0];
            });
          },
          error: function(response) {
            $(".error").text(response.message);
          }
        });
      }
    });
  }

  init();

  // API Interactions
  // –––––––––––––––––––––––––––––––––
  $scope.soundCloudConnect = function() {
    SC.connect(function() {
      SC.get('/me', function(response) {
        var value = SC.accessToken();
        createCookie("accessToken", value, 30);
      });
    });
  };

  $scope.rdioConnect = function() {
    // R.ready(function() {
      R.authenticate();
    // });
  };

  $scope.getLibrary = function() {
    $scope.userLibrary = [];
    getRdioLibrary();
    getSoundCloudLibrary();
  };  

  var getSoundCloudLibrary = function() {
    var token = getCookie('accessToken');
    SC.get('/me/favorites?oauth_token=' + token, function(response) {
      
      var tracks = response;
      $scope.$apply(function(){
        for(var i=0; i<tracks.length; i++ ) {  
          // grab the data we want and push clean track to lib 
          var track = tracks[i];
          var rcloudTrack = setSoundCloudTrack(track);
          $scope.userLibrary.push(rcloudTrack);
        }
      });  
    });
  };

  var getRdioLibrary = function() {
    if (R.currentUser) {
      R.request({
        method: "getTracksInCollection", 
        content: {
          user: R.currentUser.get("key"), 
          count: 100,
        }, complete: function(response) {
          
          var tracks = response.result;
          $scope.$apply(function(){
            for(var i=0; i<tracks.length; i++ ) {  
              var track = tracks[i];
              var rcloudTrack = setRdioTrack(track);
              $scope.userLibrary.push(rcloudTrack);
              // for dev purpose: REMOVE
              lib = $scope.userLibrary;
            }
            // put something in the queue if empty. 
            // Change to load from local storage.
            if (!rcloud.queue[0]) {
              rcloud.queue.push($scope.userLibrary[0]);
              $scope.nowPlaying = rcloud.queue[0];
            }
          });
        }
      });
    }
  };

  $scope.search = function(query) {
    $scope.search.results = [];
    angular.element(document).find("form")[0].reset();
    angular.element(document).find("form")[0].blur();

    // Rdio Search
    // –––––––––––––––
    R.request({
      method: "search", 
      content: {
        query: query, 
        types: "Track", // changes to find artist, track, or album
        count: 100
      },
      success: function(response) {
        var tracks = response.result.results;
        // add rdio source to identify which player to use
        // add to results array
        $scope.$apply(function () {
          for(var i=0; i<tracks.length; i++ ) {
            var track = tracks[i];
            var rcloudTrack = setRdioTrack(track);
            $scope.search.results.push(rcloudTrack);
            console.log($scope.search.results);
          }
        });
        
        // reset form       
        $scope.query = null;   
        
      },
      error: function(response) {
        console.log("error");
        $(".error").text(response.message);
      }
    });

    // SoundCloud Search
    // –––––––––––––––
    SC.get('/tracks', { q: query, license: 'cc-by-sa' }, function(tracks) {
      $scope.$apply(function(){
        for(var i=0; i<tracks.length; i++) {
          var track = tracks[i];
          var soundCloudTrack = setSoundCloudTrack(track);
          $scope.search.results.push(soundCloudTrack);
        }
      });

    });
  };

  $scope.closeSearch = function() {
    $scope.search.results = null;
  };


  // Rcloud Player Controls
  // –––––––––––––––––––––––––––––––––
  
  // set defaults 
  $scope.playing = false;
  $scope.currentPosition = 0;
  $scope.queue = rcloud.queue;

  $scope.playTrack = function(track) {  
    rcloud.stop();  
    rcloud.play(track);
    $scope.nowPlaying = rcloud.queue[0];

    $scope.playing = true;
    $scope.currentPosition = 0;
    // stop currently running interval
    $interval.cancel($scope.getTime);
    $scope.getTime = $interval(getCurrentTime, 1000);
  };

  var getCurrentTime = function() {
      if (rcloud.nowPlayingSource === "rdio") {
        $scope.currentPosition = R.player.position();
      } else if (rcloud.soundCloud && rcloud.nowPlayingSource === "soundCloud") {
        $scope.currentPosition = rcloud.soundCloud._player._html5Audio.currentTime;
      }
  };

  $scope.queueTrack = function(track) {
    rcloud.queue.push(track);
  };

  $scope.togglePause = function() {
    rcloud.togglePause();
    
    if (rcloud.playing) {
      $scope.playing = true;
      // start interval if not playing
      $scope.getTime = $interval(callAtInterval, 1000);
    } else if (rcloud.playing === false){
      // stop currently running interval if playing
      $interval.cancel($scope.getTime);
      $scope.playing = false;
      if (!rcloud.nowPlaying) {
        // noting playing; play first in queue...
        rcloud.play(rcloud.queue[0]);
      }
    }
  };

  $scope.previous = function() {
    rcloud.previous();
  };
  
  $scope.next = function() {
    rcloud.next();
  };


  // Mobile Menu
  // –––––––––––––––––––––––––––––––––

  $scope.menuOpen = false;
  
  $scope.menuBttnToggle = function() {

    var menu = Snap("#menu-svg"),
      lineOne   = menu.select("#line-one"),
      lineTwo   = menu.select("#line-two"),
      lineThree = menu.select("#line-three");

    $scope.menuOpen = !$scope.menuOpen;
    if ($scope.menuOpen) { 

      // move lines to center
      lineOne.animate({"y1":"50", "y2":"50"}, 100);
      lineThree.animate({"y1":"50", "y2":"50"}, 100, function() {

        // wait for lines to move to center
        $("#line-two").hide(); // hide center line
        // rotate lines
        lineOne.animate({transform: "r45, 50, 50"}, 100, mina.ease);
        lineThree.animate({transform: "r-45, 50, 50"}, 100, mina.ease) ;     
      }); 
    } else {

      // move lines back to og position
      lineOne.animate({transform: "0, 50, 50"}, 100);
      lineThree.animate({transform: "0, 50, 50"}, 100, function() {

        // wait for lines to move to og position
        $("#line-two").show(); // show center line
        // rotate lines
        lineOne.animate({"y1": "5", "y2": "5" }, 100, mina.ease);
        lineThree.animate({"y1":"95", "y2":"95"}, 100, mina.ease);  
      });   
    }
  }

}]);