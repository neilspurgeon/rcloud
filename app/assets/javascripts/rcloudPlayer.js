// Rcloud Player - Set Up
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
var RcloudPlayer = function () {
  var self = this;
  this.queue = [];
  this.playing = false;
  console.log("playing = false");
  this.nowPlaying = this.queue[0];
  this.nowPlayingSource = self.nowPlaying ? self.nowPlaying.source : null;
  // this.soundCloud = null;
  this.soundCloudSettings = { useHTML5Audio: true, 
                              preferFlash: false
                            };
  this.sc = null;
  // SoundCloud player Init
  SC.initialize({
    client_id: 'f3a51baca351723ad612f5318b1be836',
    redirect_uri: 'http://localhost:3000/#/'
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
        self.next();
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
  self.stop();           // Stop current track
  this.queue[0] = track; // add track to beggining of queue
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

    R.player.play({source: track.id});
    // RcloudPlayer.autoPlayNext() handles playing next Rdio track
  } else if (track.source === "soundCloud") {
    SC.stream("/tracks/" + track.id, self.soundCloudSettings, function(sound){
      if(self.sc){
        self.soundCloud.pause();
      } 
      self.soundCloud = sound;
      self.soundCloud.play();                  // set track
      // self.html5Audio = sound._player._html5Audio;           // use html audio
      // self.html5Audio.ontimeupdate = function() {
      //   console.log(html5Audio.currentTime);
      // };

      // self.soundCloud._html5Audio.addEventListener("ended", function(){ 
      //   alert("ended");
      //   self.next();
      //   // // remove finished track from queue
      //   // self.queue.splice(0,1);
      //   // // play next track
      //   // if (self.queue[0]) {
      //   //   self.play(self.queue[0]);
      //   //   console.log("Playing next track");
      //   // } else {
      //   //   console.log("Nothing in queue");
      //   // }
      // });

      // self.soundCloud.pause();
      // self.soundCloud.play();

    });
  }
};

// Rcloud Player - Toggle Pause
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.togglePause = function() {
  var self = this;

  if (self.playing === true) {
    self.stop();
    console.log("stopped");  
  } else {

    if (self.nowPlayingSource === "rdio") {
      R.player.togglePause();
      self.playing = true;
      console.log("resuming rdio...");
    } else if (self.nowPlayingSource === "soundCloud") {
      self.soundCloud.play();
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
  if (self.soundCloud && (self.soundCloud.getState() === "playing")) {
     console.log("stopping SoundCloud");
     self.soundCloud.pause();
  }
};

// Rcloud Player - Next
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
RcloudPlayer.prototype.next = function() {
  var self = this;
  self.stop();
  self.queue.splice(0,1);
  var nexTrack = self.queue[0];

  // check to make sure there is a next track in queue
  if (nexTrack) {
    self.play(nexTrack);
    console.log("Playing next track");
  } else {
    console.log("Nothing in queue");
  }
};

// Rcloud PLayer - Set Track from SoundCloud
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
var setRdioTrack = function(rdioTrack) { 

  // creat new track to standardize data
  var track = {};
  track.source = "rdio";
  track.id = rdioTrack.key;
  track.name = rdioTrack.title;
  track.artist = rdioTrack.artist;
  track.album = rdioTrack.album;
  track.art = rdioTrack.icon400;
  track.duration = rdioTrack.duration;
  track.url = rdioTrack.shortUrl; 
  return track;
};

// Rcloud PLayer - Set Track from SoundCloud
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
var setSoundCloudTrack = function(soundCloudTrack) { 
  // replace with largest img
  var replaceImgSize = function(str){
    var newStr = str.replace(/(large)/, "t500x500");
    return newStr;
  };

  // creat new track to standardize data
  var track = {};

  track.source = "soundCloud";
  track.id = soundCloudTrack.id;
  track.name = soundCloudTrack.title;
  track.artist = soundCloudTrack.user.username;
  track.album = null;
  track.art = soundCloudTrack.artwork_url;
  track.duration = (soundCloudTrack.duration / 1000);
  track.url = soundCloudTrack.permalink_url;
  if (track.art) {
    track.art = replaceImgSize(track.art);
  }
  return track;
};


// Rcloud Player - Init
// ––––––––––––––––––––––––––––––––––––––––––––––––––––
rcloud = new RcloudPlayer();