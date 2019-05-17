import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectCurrentPlay, selectBoxscore, selectTeams } from '../selectors/game';

const getPlayerStats = (boxscore, teams, id) => {
  const key = 'ID' + id;
  const homePlayers = boxscore.getIn(['home', 'players']);
  if (homePlayers.has(key)) {
    return {
      team: teams.get('home').toJS(),
      player: homePlayers.get(key).toJS(),
    };
  }
  return {
    team: teams.get('away').toJS(),
    player: boxscore.getIn(['away', 'players', key]).toJS(),
  };
};

const Matchup = ({boxscore, currentPlay, teams}) => {
  try {
    const pitcherId = currentPlay.getIn(['matchup', 'pitcher', 'id']);
    const batterId = currentPlay.getIn(['matchup', 'batter', 'id']);

    const {team: pitchTeam, player: pitcher} = getPlayerStats(boxscore, teams, pitcherId);
    const {team: batTeam, player: batter} = getPlayerStats(boxscore, teams, batterId);

    const display = `${pitchTeam.abbreviation} Pitching: ` + 
      `{bold}${pitcher.person.fullName}{/bold} ${pitcher.stats.pitching.inningsPitched} IP, ${pitcher.stats.pitching.pitchesThrown} P, ${pitcher.seasonStats.pitching.era} ERA\n` +
      `${batTeam.abbreviation} At Bat:   ` + 
      `{bold}${batter.person.fullName}{/bold} ${batter.stats.batting.hits}-${batter.stats.batting.atBats}, ${batter.seasonStats.batting.avg} AVG, ${batter.seasonStats.batting.homeRuns} HR`;

    return (
      <box tags content={display} wrap={false} />
    );
  } catch(error) {
    throw error;
  }
};

Matchup.propTypes = {
  boxscore: PropTypes.object,
  currentPlay: PropTypes.object,
  teams: PropTypes.object,
};

const mapStateToProps = state => ({
  boxscore: selectBoxscore(state),
  currentPlay: selectCurrentPlay(state),
  teams: selectTeams(state),
});

export default connect(mapStateToProps)(Matchup);