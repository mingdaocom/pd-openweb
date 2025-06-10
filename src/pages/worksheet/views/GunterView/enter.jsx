import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import styled from 'styled-components';
import { saveView, updateWorksheetControls } from 'worksheet/redux/actions';
import SelectFieldForStartOrEnd from 'worksheet/views/components/SelectFieldForStartOrEnd';
import { isIllegal } from 'src/pages/worksheet/views/CalendarView/util';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { getControlsForGunter } from 'src/pages/worksheet/views/GunterView/util.js';
import { getAdvanceSetting } from 'src/utils/control';
import SelectField from '../components/SelectField';
import Gunter from './index.jsx';

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
`;
@connect(state => ({ ...state.sheet }), dispatch => bindActionCreators({ saveView, updateWorksheetControls }, dispatch))
export default class GunterEnter extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      isCharge,
      noLoadAtDidMount,
      view,
      toCustomWidget,
      controls = [],
      updateWorksheetControls,
      sheetSwitchPermit,
      setViewConfigVisible,
    } = this.props;
    const { begindate = '', enddate = '' } = getAdvanceSetting(view);
    let timeControls = getControlsForGunter(controls);
    timeControls = setSysWorkflowTimeControlFormat(timeControls, sheetSwitchPermit);
    const timeControlsIds = timeControls.map(o => o.controlId);
    const isDelete = begindate && !timeControlsIds.includes(begindate); //开始时间字段已删除
    const isDeleteEnd = enddate && !timeControlsIds.includes(enddate); //结束时间字段已删除
    if (
      isDelete ||
      !begindate ||
      !enddate ||
      isDeleteEnd ||
      isIllegal(controls.find(item => item.controlId === begindate) || {}) ||
      isIllegal(controls.find(item => item.controlId === enddate) || {})
    ) {
      return (
        <Wrap>
          <SelectField
            sheetSwitchPermit={sheetSwitchPermit}
            isCharge={isCharge}
            context={
              <SelectFieldForStartOrEnd
                {...this.props}
                viewType={5}
                saveView={(data, viewNew) => {
                  if (!_.get(viewNew, ['advancedSetting', 'enddate'])) {
                    return;
                  }
                  let viewData = {};
                  const { moreSort } = view;
                  // 第一次创建Gunter时，配置排序数据
                  if (!moreSort) {
                    const { begindate = '' } = getAdvanceSetting(viewNew);
                    viewData = {
                      sortCid: begindate,
                      editAttrs: ['moreSort', 'sortCid', 'sortType', 'advancedSetting'],
                      moreSort: [
                        { controlId: begindate, isAsc: true },
                        { controlId: 'ctime', isAsc: false },
                      ],
                      sortType: 2,
                    };
                  }
                  let infoData = { ...viewNew, ...viewData };
                  const { begindate = '', enddate = '' } = getAdvanceSetting(infoData);
                  this.props.saveView(data, {
                    ...infoData,
                    displayControls: [],
                    editAttrs: [...infoData.editAttrs, 'displayControls'],
                  });
                  setViewConfigVisible(true);
                }}
                updateWorksheetControls={updateWorksheetControls}
                view={view}
                mustSameType={true}
                mustEnd={true}
                canAddTimeControl={true}
                timeControls={timeControls}
                isDelete={isDelete} //开始时间字段已删除
              />
            }
            viewType={5}
            toCustomWidget={toCustomWidget}
          />
        </Wrap>
      );
    }

    return <Gunter view={view} noLoadAtDidMount={noLoadAtDidMount} />;
  }
}
