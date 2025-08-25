import update from 'immutability-helper';
import _ from 'lodash';

export const dealControlPos = controls => {
  const sortableControls = controls.reduce((p, c) => {
    return update(p, { $push: [[c]] });
  }, []);
  return _.flatten(sortableControls.map((item, row) => item.map((control, col) => ({ ...control, row, col }))));
};

export const getCurrentSheetSavedControls = widgets => {
  return _.filter(
    _.flatten(widgets).map(item => item.data),
    item => item.controlId,
  );
};
