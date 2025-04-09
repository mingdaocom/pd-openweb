import React, { useEffect, useRef, useState } from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { refreshSheet, updateQuickFilter, resetQuickFilter } from 'worksheet/redux/actions';
import QuickFilter from './QuickFilter';

function Comp(props) {
  return <QuickFilter {...props} />;
}

Comp.propTypes = {
  emptyText: string,
  width: number,
  projectId: string,
  filters: arrayOf(shape({})),
  view: shape({}),
  controls: arrayOf(shape({})),
  updateQuickFilter: func,
  resetQuickFilter: func,
};

export default connect(
  state => ({
    // worksheet
    controls: state.sheet.controls.map(c => ({ ...c })),
    navGroupFilters: state.sheet.navGroupFilters,
    base: state.sheet.base,
  }),
  dispatch =>
    bindActionCreators(
      {
        refreshSheet,
        updateQuickFilter,
        resetQuickFilter,
      },
      dispatch,
    ),
)(Comp);
