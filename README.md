## Playball!

Watch MLB games from the comfort of your own terminal

### Why?

[MLB Gameday](http://www.mlb.com/mlb/gameday/#) and [MLB.tv](http://mlb.tv) are
great, but sometimes you want to keep an eye on a game a bit more discreetly.
This application puts the game in a terminal window and looks like you're
tailing a log file.

### Install

```
$ npm install -g playball
```

### Run

Start it with

```
$ playball
```

You will be presented with a list of today's games which haven't finished yet.
Choose one and let it roll.

### Known Issues

Playball was created by reverse engineering some of the API calls made by the
[MLB Gameday](http://www.mlb.com/mlb/gameday/#) interface. Those APIs are
designed to power a web interface, not necessary provide a linear flow of
events. Playball makes a reasonable effort to present game events in a coherent
order. However, you may occasionally see events appear out of order when things
happen quickly in a game or when the incoming Gameday data is slow to update.
I'll try to keep improving it; pull requests are also welcome.
