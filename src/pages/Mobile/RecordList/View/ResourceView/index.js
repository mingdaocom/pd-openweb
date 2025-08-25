import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import styled from 'styled-components';
import * as actions from 'mobile/RecordList/redux/actions';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { isRelateRecordTableControl } from 'src/utils/control';
import ViewErrorPage from '../components/ViewErrorPage';

const ResourceViewWrap = styled.div`
  flex: 1;
  margin-top: 10px;
  background-color: #fff;
  min-height: 0;
`;

function MobileResourceView(props) {
  const { view, controls, sheetSwitchPermit } = props;
  const viewControlInfo =
    (
      setSysWorkflowTimeControlFormat(
        controls.filter(
          item =>
            (_.includes([27, 48, 9, 10, 11, 26, 29, 28], item.type) ||
              (item.type === 30 &&
                _.includes([27, 48, 9, 10, 11, 26, 29, 28], item.sourceControlType) &&
                (item.strDefault || '').split('')[0] !== '1')) &&
            !['rowid'].includes(item.controlId) &&
            !isRelateRecordTableControl(item),
        ),
        sheetSwitchPermit,
      ) || []
    ).find(it => it.controlId === view.viewControl) || {};
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    import('src/pages/worksheet/views/ResourceView').then(component => {
      setComponent(component.default);
    });
  }, []);

  if (!viewControlInfo.controlId) {
    return <ViewErrorPage icon="arrows_square" viewName={view.name + _l('视图')} color="#4caf50" />;
  }

  if (!Component) return;

  return (
    <ResourceViewWrap>
      <Component {...props} />;
    </ResourceViewWrap>
  );
}

export default connect(
  state => ({
    quickFilter: state.mobile.quickFilter,
    worksheetInfo: state.mobile.worksheetInfo,
    filters: state.mobile.filters,
    appDetail: state.mobile.appDetail,
  }),
  dispatch => bindActionCreators(_.pick({ ...actions }, ['updateFilters']), dispatch),
)(MobileResourceView);
