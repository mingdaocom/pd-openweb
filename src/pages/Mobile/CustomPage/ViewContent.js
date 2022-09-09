import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import { View } from 'src/pages/customPage/components/editWidget/view/Preview';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';

function ViewContent(props) {
  const { setting } = props;
  const objectId = _.get(setting, 'config.objectId');
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  return (
    <View {...props} filtersGroup={filtersGroup} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup
  })
)(ViewContent);
