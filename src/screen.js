import blessed from 'blessed';

let screen;

function getScreen() {
  if (screen === undefined) {
    screen = blessed.screen({
      autoPadding: true,
      debug: true,
      smartCSR: true,
      title: 'Playball!',
      handleUncaughtExceptions: false,
    });
    
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  }

  return screen;
}


export default getScreen;
