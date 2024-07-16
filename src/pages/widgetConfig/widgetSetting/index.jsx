import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { DEFAULT_CONFIG } from '../config/widget';
import { enumWidgetType, supportWidgetIntroOptions } from '../util';
import WidgetIntro from './components/WidgetIntro';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import SettingContent from './content/SettingContent';
import StyleContent from './content/StyleContent';
import ExplainContent from './content/ExplainContent';
import CustomEvent from './content/CustomEvent';
import { getAdvanceSetting } from '../util/setting';

const SettingWrap = styled.div`
  position: relative;
  width: 350px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .emptyStatus {
    margin-top: 240px;
    text-align: center;
  }
  .settingContentWrap {
    width: 100%;
    padding: 0px 20px 60px 20px;
    overflow-y: scroll;
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

  // 1: 设置，2: 样式， 3: 说明，4: 事件
  const [mode, setMode] = useState(1);
  const allProps = {
    ...rest,
    data,
    info,
    globalSheetInfo,
    widgets,
    mode,
    queryConfig,
    customQueryConfig,
    isRecycle,
    onChange: onChange,
  };

  const getContent = () => {
    if (mode === 2) {
      return <StyleContent {...allProps} />;
    } else if (mode === 3) {
      return <ExplainContent {...allProps} />;
    } else if (mode === 4) {
      return <CustomEvent {...allProps} />;
    } else {
      return <SettingContent {...allProps} />;
    }
  };

  useEffect(() => {
    const tempMode = safeParse(window.localStorage.getItem(`worksheetMode-${globalSheetInfo.worksheetId}`) || '1');
    const canNotSet = isRecycle || (controlId || '').includes('-') || !supportWidgetIntroOptions(data, tempMode);
    setMode(canNotSet ? 1 : tempMode || mode);
  }, [controlId]);

  const renderSetting = () => {
    if (isEmpty(data)) return <div className="emptyStatus">{_l('没有选中的字段')}</div>;
    if ([17, 18].includes(type)) return <div className="emptyStatus">{_l('日期段控件已下架，不支持配置')}</div>;
    return (
      <Fragment>
        <WidgetIntro
          {...allProps}
          setMode={value => {
            safeLocalStorageSetItem(`worksheetMode-${globalSheetInfo.worksheetId}`, JSON.stringify(value));
            setMode(value);
          }}
        />
        <div className="settingContentWrap">{getContent()}</div>
      </Fragment>
    );
  };

  return <SettingWrap id="widgetConfigSettingWrap">{renderSetting()}</SettingWrap>;
}

export default errorBoundary(WidgetSetting);
