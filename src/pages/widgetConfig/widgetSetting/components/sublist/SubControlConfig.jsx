import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SettingContent from '../../content/SettingContent';
import StyleContent from '../../content/StyleContent';
import ExplainContent from '../../content/ExplainContent';
import WidgetIntro from '../WidgetIntro';
import _ from 'lodash';
import { getAdvanceSetting } from '../../../util/setting';

const SubControlConfigWrap = styled.div`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 9;
  display: flex;
  flex-direction: column;
  & > div:nth-child(2) {
    margin-top: 0;
  }
  .subListConfigContent {
    flex: 1;
    min-width: 0;
    padding: 0 20px 60px 20px;
    overflow: auto;
    overflow-x: hidden;
  }
  .backToSupConfig {
    line-height: 36px;
    padding: 12px 20px;
    font-size: 15px;
    color: #151515;
    span {
      margin-left: 6px;
    }
  }
  .introSwitch .introSwitchMenu {
    width: 160px;
  }
`;

export default function SubControlConfig({
  subListData,
  controls,
  control,
  backTop,
  changeWidgetData,
  allControls,
  subQueryConfigs,
  updateSubQueryConfigs,
  ...rest
}) {
  const { controlId } = control || {};
  const queryId = _.get(getAdvanceSetting(control, 'dynamicsrc'), 'id');
  const { controlName, dataSource: subListSheetId } = subListData;
  // 1: 设置，2: 样式， 3: 说明
  const [mode, setMode] = useState(1);

  const handleChange = obj => {
    changeWidgetData(controlId, obj);
  };
  const subListProps = {
    ...rest,
    data: control,
    onChange: handleChange,
    from: 'subList',
    subListSheetId,
    mode: mode,
    allControls: controls.filter(c => c.controlId !== controlId),
    globalSheetControls: allControls,
    queryConfig: _.find(subQueryConfigs || [], i => i.id === queryId) || {},
    updateQueryConfigs: updateSubQueryConfigs,
    queryControls: controls, // 子表allControls被过滤过，用新字段覆盖
  };

  const getContent = () => {
    if (mode === 2) {
      return <StyleContent {...subListProps} />;
    } else if (mode === 3) {
      return <ExplainContent {...subListProps} />;
    } else {
      return <SettingContent {...subListProps} />;
    }
  };

  useEffect(() => {
    setMode(1);
  }, [controlId]);

  return (
    <SubControlConfigWrap>
      <div className="backToSupConfig pointer" onClick={backTop}>
        <i className="icon-arrow-left-border Font18 Gray_75"></i>
        <span className="Bold">{controlName}</span>
      </div>
      <WidgetIntro {...subListProps} setMode={setMode} />
      <div className="subListConfigContent">{getContent()}</div>
    </SubControlConfigWrap>
  );
}
