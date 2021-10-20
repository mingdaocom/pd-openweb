import React, { useEffect, useRef, useState } from 'react';
import { arrayOf, func, number, shape } from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { refreshSheet, updateQuickFilter, resetQuickFilter } from 'worksheet/redux/actions';
import autoSize from 'ming-ui/decorators/autoSize';
import Conditions from './Conditions';

const Con = styled.div`
  position: relative;
  border-top: 1px solid #e0e0e0;
  padding: 8px 0 0;
  display: flex;
  flex-direction: row;
`;

const Expand = styled.div`
  width: 87px;
  padding: 0 20px 5px 24px;
  display: flex;
  align-items: flex-end;
`;

function isFullLine(filter) {
  return String((filter.advancedSetting || {}).direction) === '1';
}
function QuickFilter(props) {
  const { width, view, controls, filters = [], refreshSheet, updateQuickFilter, resetQuickFilter } = props;
  const filtersLength = useRef(filters.length);
  const needClickSearch = useRef(_.get(view, 'advancedSetting.clicksearch'));
  let colNum = 2;
  if (width > 1200) {
    colNum = 4;
  } else if (width > 800) {
    colNum = 3;
  }
  const showQueryBtn = _.get(view, 'advancedSetting.enablebtn') === '1';
  const fullLineCount = filters.filter(isFullLine).length;
  const showExpand = filters.length > (showQueryBtn ? colNum - 1 : colNum) || (filters.length > 1 && fullLineCount > 0);
  const [fullShow, setFullShow] = useState(showExpand && localStorage.getItem('QUICK_FILTER_FULL_SHOW') === 'true');
  let visibleFilters = fullShow ? filters : filters.slice(0, showQueryBtn ? colNum - 1 : colNum);
  let firstIsFullLine = false;
  if (!fullShow) {
    const firstFullLineIndex = _.findIndex(visibleFilters, isFullLine);
    if (firstFullLineIndex === 0) {
      visibleFilters = visibleFilters.slice(0, 1);
      firstIsFullLine = true;
    } else if (firstFullLineIndex > -1) {
      visibleFilters = visibleFilters.slice(0, firstFullLineIndex);
    }
  }
  let operateIsNewLine = false;
  try {
    const lastIsFullLine = isFullLine(_.last(visibleFilters));
    if (!fullShow) {
      operateIsNewLine = false;
    } else if (lastIsFullLine) {
      operateIsNewLine = true;
    } else if (fullLineCount === 0) {
      operateIsNewLine = _.sum(visibleFilters.map(f => (isFullLine(f) ? colNum : 1))) % colNum === 0;
    } else {
      const lastFullLineIndex = _.findLastIndex(visibleFilters, isFullLine);
      operateIsNewLine =
        _.sum(visibleFilters.slice(lastFullLineIndex + 1).map(f => (isFullLine(f) ? colNum : 1))) % colNum === 0;
    }
  } catch (err) {}
  useEffect(() => {
    filtersLength.current = 0;
    needClickSearch.current = undefined;
  }, [view.viewId]);
  useEffect(() => {
    if (filtersLength.current > 0 && filters.length > filtersLength.current && !fullShow) {
      setFullShow(true);
    }
    filtersLength.current = filters.length;
  }, [filters.length]);
  useEffect(() => {
    if (needClickSearch.current === '1' && _.get(view, 'advancedSetting.clicksearch') === '0') {
      refreshSheet(view);
    }
    needClickSearch.current = _.get(view, 'advancedSetting.clicksearch');
  }, [_.get(view, 'advancedSetting.clicksearch')]);
  return (
    <Con>
      <Conditions
        operateIsNewLine={operateIsNewLine}
        firstIsFullLine={firstIsFullLine}
        view={view}
        controls={controls}
        filters={visibleFilters}
        colNum={colNum}
        fullShow={fullShow}
        showExpand={showExpand}
        setFullShow={setFullShow}
        updateQuickFilter={updateQuickFilter}
        resetQuickFilter={resetQuickFilter}
      />
      {showExpand && <Expand />}
    </Con>
  );
}

QuickFilter.propTypes = {
  width: number,
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
)(autoSize(QuickFilter, { onlyWidth: true }));
