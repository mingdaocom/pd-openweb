import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { SETTING_MODE_DISPLAY } from '../config/setting';
import { DEFAULT_CONFIG } from '../config/widget';
import { enumWidgetType, supportWidgetIntroOptions } from '../util';
import { getAdvanceSetting } from '../util/setting';
import WidgetBatchOption from '../widgetDisplay/components/WidgetBatchOption';
import { CloseIcon, FixedIcon, WidgetStyleSetting } from '../widgetDisplay/components/WidgetStyle';
import StyleContent from '../widgetSetting/components/StyleContent';
import WidgetIntro from './components/WidgetIntro';
import CustomEvent from './content/CustomEvent';
import ExplainContent from './content/ExplainContent';
import SettingContent from './content/SettingContent';

const SettingWrap = styled.div`
  position: relative;
  width: 350px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  ${props => (!props.showSetting ? 'display: none;' : '')}
  .widgetSettingHeader {
    margin: 14px 20px 0 20px;
    display: flex;
    align-items: center;
    position: relative;
    .closeIcon {
      position: absolute;
      right: 0px;
      top: 0px;
    }
  }

  .emptyStatus {
    margin-top: 240px;
    text-align: center;
  }
  .settingContentWrap {
    width: 100%;
    padding: 0px 20px 60px 20px;
    overflow-x: hidden;
  }
  .labelWrap {
    display: flex;
    margin-top: 8px;
    .icon-help {
      margin-left: 4px;
    }
    .ming.Checkbox {
      display: inline-flex;
      align-items: center;
      .Checkbox-box {
        margin-right: 10px;
        flex-shrink: 0;
        .icon-help {
          margin-left: 4px;
        }
      }
      &.displayCover {
        align-items: flex-start;
        span:nth-child(2) {
          margin-top: -2px;
          white-space: break-spaces;
        }
      }
    }
  }
`;

function WidgetSetting(props) {
  const {
    widgets = [],
    activeWidget: data = {},
    handleDataChange,
    queryConfigs = [],
    globalSheetInfo,
    isRecycle,
    styleInfo = {},
    setStyleInfo,
    setActiveWidget,
    settingPanelFixed,
    activeWidget,
    setPanelVisible = () => {},
    batchActive,
    settingPanelVisible,
    ...rest
  } = props;
  const { type, controlId } = data;
  const ENUM_TYPE = enumWidgetType[type];
  const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
  const queryId = _.get(getAdvanceSetting(data, 'dynamicsrc'), 'id');
  const queryConfig = _.find(queryConfigs, item => item.id === queryId) || {};
  const customQueryConfig = queryConfigs.filter(i => i.eventType === 1);
  const onChange = (obj, callback) => {
    if (isEmpty(obj)) return;
    handleDataChange(controlId, { ...data, ...obj }, callback);
  };

  const showSetting = useMemo(() => {
    if (!settingPanelFixed) return true;
    return settingPanelFixed && settingPanelVisible;
  }, [settingPanelFixed, settingPanelVisible]);

  // 1: 设置，2: 样式， 3: 说明，4: 事件
  const [settingMode, setSettingMode] = useState(SETTING_MODE_DISPLAY.SETTING);
  const allProps = {
    ...rest,
    data,
    info,
    globalSheetInfo,
    widgets,
    settingMode,
    queryConfig,
    customQueryConfig,
    isRecycle,
    styleInfo,
    setStyleInfo,
    activeWidget,
    setActiveWidget,
    settingPanelFixed,
    fixedKey: 'settingPanelFixed',
    setPanelVisible,
    batchActive,
    settingPanelVisible,
    onChange: onChange,
  };

  const getContent = () => {
    if (!_.isEmpty(batchActive)) {
      return <WidgetBatchOption batchActive={batchActive} {...allProps} />;
    }
    if (styleInfo.activeStatus && !isRecycle)
      return (
        <WidgetStyleSetting {...allProps} handleChange={obj => setStyleInfo({ info: { ...styleInfo.info, ...obj } })} />
      );
    if (isEmpty(data)) return <div className="emptyStatus">{_l('没有选中的字段')}</div>;
    if ([17, 18].includes(type)) return <div className="emptyStatus">{_l('日期段控件已下架，不支持配置')}</div>;

    switch (settingMode) {
      case SETTING_MODE_DISPLAY.CONTROL_STYLE:
        return <StyleContent {...allProps} />;
      case SETTING_MODE_DISPLAY.DESC:
        return <ExplainContent {...allProps} />;
      case SETTING_MODE_DISPLAY.EVENT:
        return <CustomEvent {...allProps} />;
      default:
        return <SettingContent {...allProps} />;
    }
  };

  const renderHeader = () => {
    if (!_.isEmpty(batchActive)) return null;

    let content = null;
    if (styleInfo.activeStatus && !isRecycle) {
      content = (
        <Fragment>
          <div className="Font17 Bold mRight10">{_l('表单样式')}</div>
          <FixedIcon {...allProps} />
        </Fragment>
      );
    } else {
      if (isEmpty(data) || [17, 18].includes(type)) {
        content = <FixedIcon {...allProps} />;
      } else {
        content = (
          <WidgetIntro
            {...allProps}
            setSettingMode={value => {
              safeLocalStorageSetItem(`worksheetMode-${globalSheetInfo.worksheetId}`, JSON.stringify(value));
              setSettingMode(value);
            }}
          />
        );
      }
    }

    return (
      <div className="widgetSettingHeader">
        {content}
        {!isRecycle && (
          <CloseIcon
            onClose={() => {
              setPanelVisible({ settingVisible: false });
              setActiveWidget({});
              if (styleInfo.activeStatus) {
                setStyleInfo({ activeStatus: false });
              }
            }}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const tempMode = safeParse(window.localStorage.getItem(`worksheetMode-${globalSheetInfo.worksheetId}`) || '1');
    const canNotSet = isRecycle || (controlId || '').includes('-') || !supportWidgetIntroOptions(data, tempMode);
    setSettingMode(canNotSet ? 1 : tempMode || settingMode);
  }, [controlId]);

  return (
    <SettingWrap id="widgetConfigSettingWrap" showSetting={showSetting}>
      {renderHeader()}
      <div className="settingContentWrap">{getContent()}</div>
    </SettingWrap>
  );
}

export default errorBoundary(WidgetSetting);
