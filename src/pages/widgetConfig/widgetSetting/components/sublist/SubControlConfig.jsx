import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { SETTING_MODE_DISPLAY } from '../../../config/setting';
import { getAdvanceSetting } from '../../../util/setting';
import ExplainContent from '../../content/ExplainContent';
import SettingContent from '../../content/SettingContent';
import StyleContent from '../StyleContent';
import WidgetIntro from '../WidgetIntro';

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
    padding: 0 20px;
    flex: unset;
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
  const [settingMode, setSettingMode] = useState(SETTING_MODE_DISPLAY.SETTING);

  const handleChange = obj => {
    changeWidgetData(controlId, obj);
  };
  const subListProps = {
    ...rest,
    subListData,
    data: control,
    onChange: handleChange,
    from: 'subList',
    subListSheetId,
    settingMode: settingMode,
    allControls: controls.filter(c => c.controlId !== controlId),
    globalSheetControls: allControls,
    queryConfig: _.find(subQueryConfigs || [], i => i.id === queryId) || {},
    updateQueryConfigs: updateSubQueryConfigs,
    queryControls: controls, // 子表allControls被过滤过，用新字段覆盖
  };

  const getContent = () => {
    switch (settingMode) {
      case SETTING_MODE_DISPLAY.CONTROL_STYLE:
        return <StyleContent {...subListProps} />;
      case SETTING_MODE_DISPLAY.DESC:
        return <ExplainContent {...subListProps} />;
      default:
        return <SettingContent {...subListProps} />;
    }
  };

  useEffect(() => {
    setSettingMode(SETTING_MODE_DISPLAY.SETTING);
  }, [controlId]);

  return (
    <SubControlConfigWrap>
      <div className="backToSupConfig pointer" onClick={backTop}>
        <i className="icon-arrow-left-border Font18 Gray_75"></i>
        <span className="Bold">{controlName}</span>
      </div>
      <WidgetIntro {...subListProps} setSettingMode={setSettingMode} />
      <div className="subListConfigContent">{getContent()}</div>
    </SubControlConfigWrap>
  );
}
