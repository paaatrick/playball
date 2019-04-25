import { createSelector } from 'reselect';

const scheduleSelector = state => state.schedule;

export const selectLoading = createSelector(
  scheduleSelector,
  schedule => schedule.get('loading')
);

export const selectError = createSelector(
  scheduleSelector,
  schedule => schedule.get('error')
);

export const selectData = createSelector(
  scheduleSelector,
  schedule => schedule.get('data')
);
