
import blessed from 'blessed';

const screen = blessed.screen({
    autoPadding: true,
    debug: true,
    smartCSR: true,
    title: 'Playball!',
    handleUncaughtExceptions: false,
});

screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
});

export default screen;
