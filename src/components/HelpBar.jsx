import React from 'react';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const HelpBar = () => {
  const keys = useSelector(state => state.keys);
  const content = keys.map(({ key, label }) => `{inverse}${key}{/inverse}:${label}`).join('  ');
  return (
    <element>
      <LoadingSpinner />
      <box left={3} 
        content={content} 
        tags 
      />
    </element>
  );
};

export default HelpBar;