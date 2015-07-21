#Rcloud

### About

rcloud.io

Rcloud aims to seamlessly blend SoundCloud and Rdio's music libraries and players into one integrated application. 

At it's core, Rcloud is wrapper for both their api's. For each function, Rcloud conditionally switches bewtween using either Rdio or SoundCloud, or both in situations such as searching libraries.

######Note: 
Currently, Rcloud is an entirely front-end application. There is however a user signup/login and database that is unused at the momement. For future features, login will be necessary. 

###Technologies Used
- Ruby On Rails
- PostgreSQL 
- Devise
- AngularJS
- SASS
- Susy
- Rdio JS API (Beta)
- SoundCloud JS SDK

###Current Features
- Connect Rdio and SoundCloud accounts. Unconnected users get top Rdio tracks and 30 second previews instead.
- Remembers connected acounts by creating a cookie to store the access token.
- Search and play tracks from both Rdio and SoundCloud's libraries.
- Add track's to queue.
- Autoplay next track in queue.
- Restart current track or skip to next track.
- Updates current track duration while playing.
- Mobile first design. Plays across all devices.

###Coming Soon Features
- Use local storage to store queue.
- Remove tracks from queue.
- Go back through previous tracks.
- "Heart" and "Un-Heart" tracks on Rdio or SoundCloud.
- Add duration to track info.
- Album, Artist, and Track filters in both library and search results.
- Add signup/login routes. Use user model to store Rdio and SoundCloud connect access tokens and info. 