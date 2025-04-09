import { v4 as uuidv4 } from 'uuid';

export const defaultFilterData = {
  filterId: uuidv4(),
  name: '',
  global: true,
  dataType: 0,
  filterType: 0,
  objectControls: [],
  advancedSetting: {},
};
