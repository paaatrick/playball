import React from 'react';

import Count from './Count';
import Bases from './Bases';
import LineScore from './LineScore';
import Matchup from './Matchup';
import AtBat from './AtBat';
import AllPlays from './AllPlays';
import InningDisplay from './InningDisplay';

function LiveGame()  {
  return (
    <element>
      <element top={0} left={1} width='100%-1' height={3}>
        <element left={0} width={2}>
          <InningDisplay />
        </element>
        <element left={5} width='25%-5'>
          <Count />
        </element>
        <element left='25%+1' width='25%'>
          <Bases />
        </element>
        <element left='50%+2' width='50%-2'>
          <LineScore />
        </element>
      </element>
      <line orientation='horizontal' type='line' top={3} width='100%' />
      <element top={4} left={1}>
        <element width='50%-1'>
          <element top={0} height={2}>
            <Matchup />
          </element>
          <element top={3}>
            <AtBat />
          </element>
        </element>
        <line orientation='vertical' type='line' left='50%' />
        <element left='50%+2' width='50%-2'>
          <AllPlays />
        </element>
      </element>
    </element>
  );
}

export default LiveGame;