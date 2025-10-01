import pkg from './package.js';

import Conf from 'conf';

const colorPattern = '^(((light-|bright-)?(black|red|green|yellow|blue|magenta|cyan|white|grey))|default|#([0-9a-fA-F]{3}){1,2})$';

const schema = {
  color: {
    type: 'object',
    properties: {
      ball: {
        type: 'string',
        default: 'green',
        pattern: colorPattern,
      },
      strike: {
        type: 'string',
        default: 'red',
        pattern: colorPattern,
      },
      out: {
        type: 'string',
        default: 'red',
        pattern: colorPattern,
      },
      'on-base': {
        type: 'string',
        default: 'yellow',
        pattern: colorPattern,
      },
      'strike-out': {
        type: 'string',
        default: 'red',
        pattern: colorPattern,
      },
      'walk': {
        type: 'string',
        default: 'green',
        pattern: colorPattern,
      },
      'other-event': {
        type: 'string',
        default: 'white',
        pattern: colorPattern,
      },
      'in-play-no-out': {
        type: 'string',
        default: 'blue',
        pattern: colorPattern,
      },
      'in-play-out': {
        type: 'string',
        default: 'white',
        pattern: colorPattern,
      },
      'in-play-runs-bg': {
        type: 'string',
        default: 'white',
        pattern: colorPattern,
      },
      'in-play-runs-fg': {
        type: 'string',
        default: 'black',
        pattern: colorPattern,
      },
      'favorite-star': {
        type: 'string',
        default: 'yellow',
        pattern: colorPattern,
      },
    },
    default: {}
  },
  favorites: {
    type: 'array',
    items: {
      type: 'string',
      enum: [
        'ATL',
        'AZ',
        'BAL',
        'BOS',
        'CHC',
        'CIN',
        'CLE',
        'COL',
        'CWS',
        'DET',
        'HOU',
        'KC',
        'LAA',
        'LAD',
        'MIA',
        'MIL',
        'MIN',
        'NYM',
        'NYY',
        'OAK',
        'PHI',
        'PIT',
        'SD',
        'SEA',
        'SF',
        'STL',
        'TB',
        'TEX',
        'TOR',
        'WSH'
      ],
    },
    default: []
  },
};

const config = new Conf({
  projectName: pkg.name,
  schema,
});

function serialize(value) {
  if (value && Array.isArray(value)) {
    return value.join(',');
  } 
  return value;
}

function deserialize(key, value) {
  if (value && schema[key]?.type === 'array') {
    return value.split(/[\s,]+/);
  }
  return value;
}

export function get(key) {
  return serialize(config.get(key));
}

export function set(key, value) {
  return config.set(key, deserialize(key, value));
}

export function unset(key) {
  if (key) {
    return config.delete(key);
  } else {
    return config.clear();
  }
}

function flatten(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj).sort()) {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      const sub = flatten(value);
      for (const [subkey, subvalue] of Object.entries(sub)) {
        result[key + '.' + subkey] = subvalue;
      }
    } else {
      result[key] = serialize(value);
    }
  }
  return result;
}

export function getAll() {
  return flatten(config.store);
}
