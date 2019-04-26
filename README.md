## Playball!
Watch MLB games from the comfort of your own terminal

![screenshot](https://i.imgur.com/SdA4fWR.gif)

### Why?
[MLB Gameday](http://www.mlb.com/mlb/gameday/#) and [MLB.tv](http://mlb.tv) are
great, but sometimes you want to keep an eye on a game a bit more discreetly.
`playball` puts the game in a terminal window.

### Install
```
$ npm install -g playball
```

### Run
No options, just run it
```
$ playball
```

### Keys
key | action
----|--------
<kbd>q</kbd> | quit
<kbd>&uarr;</kbd>, <kbd>&darr;</kbd> | change highlighted game in list; scroll list of plays in game
<kbd>enter</kbd> | view highlighted game in list
<kbd>l</kbd> | return to list of games

### Development
```
git clone https://github.com/paaatrick/playball.git
cd playball
npm install
npm start
```
Contributions are welcome!
