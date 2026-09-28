import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import MapView from 'src/pages/worksheet/views/MapView';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import ViewErrorPage from '../components/ViewErrorPage';
import SearchRecord from './SearchRecord';

const Wrap = styled.div`
  position: relative;
`;

export default function MobileMapView(props) {
  const { view, controls, sheetSwitchPermit } = props;
  const { viewControl } = view;
  const isHaveSelectControl =
    viewControl &&
    _.find(setSysWorkflowTimeControlFormat(controls, sheetSwitchPermit), item => item.controlId === viewControl);

  if (!isHaveSelectControl) {
    return <ViewErrorPage icon="location_map" viewName={view.name + _l('视图')} color="#EB2F96" />;
  }

  return (
    <Wrap>
      <SearchRecord view={view} />
      <MapView {...props} />
    </Wrap>
  );
}
