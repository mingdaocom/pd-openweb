import React from 'react';
import ResourceView from 'src/pages/worksheet/views/ResourceView';
import ViewErrorPage from '../components/ViewErrorPage';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import styled from 'styled-components';

export default function MobileResourceView(props) {
  
  // return (
  //   <div className="h100 flexColumn justifyContentCenter alignItemsCenter Gray_bd">
  //     <i className="icon-computer mBottom32" style={{ fontSize: 100 }} />
  //     <div className="Font17">{_l('移动端暂不支持此视图')}</div>
  //     <div className="Font17">{_l('请前往电脑端进行查看')}</div>
  //   </div>
  // );

  const { view, controls, sheetSwitchPermit } = props;
  const viewControlInfo =
    (
      setSysWorkflowTimeControlFormat(
        controls.filter(item => _.includes([1, 2, 27, 48, 9, 10, 11, 26, 29], item.type)),
        sheetSwitchPermit,
      ) || []
    ).find(it => it.controlId === view.viewControl) || {};

  if (!viewControlInfo.controlId) {
    return <ViewErrorPage icon="arrows_square" viewName={view.name + _l('视图')} color="#4caf50" />;
  }

  return <ResourceView {...props} />;
}
