import blessed from 'blessed';

let screen;

const DEFAULT_TITLE = 'Playball!';

function getScreen() {
  if (screen === undefined) {
    screen = blessed.screen({
      autoPadding: true,
      debug: true,
      smartCSR: true,
      title: DEFAULT_TITLE,
      handleUncaughtExceptions: false,
    });
    
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  }

  return screen;
}

export function resetTitle() {
  getScreen().title = DEFAULT_TITLE;
}

export function setTitle(title) {
  getScreen().title = title;
}

export default getScreen;
