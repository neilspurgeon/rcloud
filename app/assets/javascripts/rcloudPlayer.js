// Rcloud Player - Set Up
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
var RcloudPlayer = function () {
  var self = this;
  this.queue = [];
  this.playing = false;
  console.log("playing = false");
  this.nowPlaying = this.queue[0];
  this.nowPlayingSource = self.nowPlaying ? self.nowPlaying.source : null;
  this.soundCloudPlayer = null;
  this.soundCloudSettings = {useHTML5Audio: true, preferFlash: false};
  // this.autoPlayNext(); // init autoplay

  // SoundCloud player Init
  SC.initialize({
    client_id: 'f3a51baca351723ad612f5318b1be836',
    redirect_uri: 'http://localhost:3000'
  });
};

// Rcloud Player - Auto Play Next
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.autoPlayNext = function() {
  var self = this;
  this.positionCounter = 0; // 1 = starting track, 2 = finished playing  

  // wait for Rdio player to be ready
  R.ready(function() {
    R.player.on("change:playingSource", function() {
      
      // capture when track finishes
      // every 2nd change = end of track
      self.positionCounter += 1;
      console.log(self.positionCounter);
      // we only the care about the second change...
      if (self.positionCounter === 2) {
        self.positionCounter = 0;
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
  });  
};


// Rcloud Player - Play
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
// Takes the full track object from Rdio or SoundCloud
// Determines which player to use and starts playing
// Sets event to trigger next in queue when track is finished 
RcloudPlayer.prototype.play = function (track) {
  var self = this;
  this.queue[0] = track; // add track to beggining of queue
  self.stop();           // Stop current track
  this.nowPlaying = this.queue[0];
  this.nowPlayingSource = self.nowPlaying ? self.nowPlaying.source : null;
  this.playing = true;
  console.log(self.queue);
  if (this.positionCounter > 0) {
    // 
    this.positionCounter -= 1;
  }
  // restart autplay countar
  R.player.off("change:playingSource");
  self.autoPlayNext(); 

  // determine Rdio or SoundCloud player
  if (track.source === "rdio") {

    R.player.play({source: track.key});
    // RcloudPlayer.autoPlayNext() handles playing next Rdio track

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

// Rcloud Player - Toggle Pause
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.togglePause = function() {
  var self = this;

  if (self.playing === true) {
    self.stop();
    console.log("stoped");  
  } else {

    if (self.nowPlayingSource === "rdio") {
      R.player.togglePause();
      self.playing = true;
      console.log("resuming rdio...");
    } else if (self.nowPlayingSource === "soundCloud") {
      self.soundCloudPlayer.play();
      self.playing = true;
      console.log("resuming soundcloud...");
    }
  }
};

// Rcloud Player - Stop (really just a pause...)
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.stop = function() {
  this.playing = false;
  console.log("playing = false");
  var self = this;

  // stop Rdio
  R.player.pause();
  // stop SoundCloud
  if (self.soundCloudPlayer && (self.soundCloudPlayer.getState() === "playing")) {
     console.log("stopping SoundCloud");
     self.soundCloudPlayer.pause();
  }
};

// Rcloud Player - Stop (really just a pause...)
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.stop = function() {

};

// Rcloud Player - Init
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
rcloud = new RcloudPlayer();