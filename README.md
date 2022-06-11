## Playball!
Watch MLB games from the comfort of your own terminal

![screenshot](https://i.imgur.com/SdA4fWR.gif)

### Why?
[MLB Gameday](http://www.mlb.com/mlb/gameday/#) and [MLB.tv](http://mlb.tv) are
great, but sometimes you want to keep an eye on a game a bit more discreetly.
`playball` puts the game in a terminal window.

### Quick Start
Just want to try it out?
```
$ npx playball
```

### Install
Ready for the big leagues? Install the package globally
```
$ npm install -g playball
```
Then run it
```
$ playball
```

### Keys
#### Global
key | action
----|--------
<kbd>q</kbd> | quit
<kbd>c</kbd> | go to schedule view
<kbd>s</kbd> | go to standings view

#### Schedule View
key | action
----|--------
<kbd>&darr;</kbd>/<kbd>j</kbd>, <kbd>&uarr;</kbd>/<kbd>k</kbd>, <kbd>&larr;</kbd>/<kbd>h</kbd>, <kbd>&rarr;</kbd>/<kbd>l</kbd> | change highlighted game
<kbd>enter</kbd> | view highlighted game
<kbd>p</kbd> | show previous day's schedule/results
<kbd>n</kbd> | show next day's schedule
<kbd>t</kbd> | return to today's schedule

#### Game View
key | action
----|--------
<kbd>&darr;</kbd>/<kbd>j</kbd>, <kbd>&uarr;</kbd>/<kbd>k</kbd> | scroll list of all plays

### Development
```
git clone https://github.com/paaatrick/playball.git
cd playball
npm install
npm start
```
Contributions are welcome!
