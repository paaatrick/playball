import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStandings, selectData } from '../features/standings';

function Standings() {
  const dispatch = useDispatch();
  const standings = useSelector(selectData);
  useEffect(() => dispatch(fetchStandings()), []);

  return (
    <box content={JSON.stringify(standings)} />
  );
}

export default Standings;
