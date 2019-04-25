import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const HelpBar = () => (
  <element>
    <LoadingSpinner />
    <box left={3} 
      content={'{inverse}Q{/inverse}:Quit  {inverse}L{/inverse}:List Games'} 
      tags 
    />
  </element>
);

export default HelpBar;