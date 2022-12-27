import React, { useEffect, useState } from 'react';
import { View } from '../editWidget/view/Preview';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const ViewDisplay = props => {
  const { setting, filtersGroup } = props;
  const objectId = _.get(setting, 'config.objectId');
  const filters = formatFiltersGroup(objectId, filtersGroup);
  return (
    <View {...props} filtersGroup={filters} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.customPage.filtersGroup
  })
)(ViewDisplay);
