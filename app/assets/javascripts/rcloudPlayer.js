// Rcloud Player - Set Up
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
var RcloudPlayer = function () {
  var self = this;
  this.queue = [];
  this.nowPlaying = this.queue[0];
  this.nowPlayingSource = self.nowPlaying ? self.nowPlaying.source : null;
  this.soundCloudPlayer = null;
  this.soundCloudSettings = {useHTML5Audio: true, preferFlash: false};

  // SoundCloud player Init
  SC.initialize({
    client_id: 'f3a51baca351723ad612f5318b1be836',
    redirect_uri: 'http://localhost:3000'
  });
};

// Rcloud Player - Play
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
// Takes the full track object from Rdio or SoundCloud
// Determines which player to use and starts playing
// Sets event to trigger next in queue when track is finished 
RcloudPlayer.prototype.play = function (track) {
  var self = this;
  // add track to beggining of queue
  this.queue[0] = track;

  // Stop current track
  self.stop();

  // determine Rdio or SoundCloud player
  if (track.source === "rdio") { 
    R.player.play({source: track.key});

    // capture when track finishes
    // slightly more elegant than using setInterval
    var positionCounter = 0; // 1 = starting track, 2 = finished playing  
    R.player.on("change:playingSource", function() {
      positionCounter += 1;
      console.log(positionCounter);
      // we only the care about the second change...
      if (positionCounter === 2) {
        // remove finished track from queue
        self.queue.splice(0,1);
        // play next track
        if (self.queue[0]) {
          self.play(self.queue[0]);
          console.log("Playing next track");
        } else {
          console.log("Nothing in queue");
        }
      }
    });
  } else if (track.source === "soundCloud") {
    SC.stream("/tracks/" + track.id, self.soundCloudSettings, function(sound){  
      self.soundCloudPlayer = sound;                    // set track
      html5Audio = sound._player._html5Audio;           // use html audio
      html5Audio.addEventListener('ended', function(){  
        // remove finished track from queue
        self.queue.splice(0,1);
        // play next track
        if (self.queue[0]) {
          self.play(self.queue[0]);
          console.log("Playing next track");
        } else {
          console.log("Nothing in queue");
        }
      });

      self.soundCloudPlayer.play();
    });

  }
};

RcloudPlayer.prototype.stop = function() {
  var self = this;
  // stop Rdio
  R.player.pause();
  // stop SoundCloud
  if (self.soundCloudPlayer && (self.soundCloudPlayer.getState() === "playing")) {
     console.log("stopping SoundCloud");
     self.soundCloudPlayer.stop();
  }
};