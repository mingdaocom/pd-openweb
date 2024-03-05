import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { isEmpty } from 'lodash';
import { DEFAULT_CONFIG } from '../config/widget';
import { enumWidgetType } from '../util';
import WidgetIntro from './components/WidgetIntro';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import SettingContent from './content/SettingContent';
import StyleContent from './content/StyleContent';
import ExplainContent from './content/ExplainContent';

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
  const { widgets = [], activeWidget: data = {}, handleDataChange, queryConfigs = [], ...rest } = props;
  const { type, controlId } = data;
  const ENUM_TYPE = enumWidgetType[type];
  const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
  const queryConfig = _.find(queryConfigs, item => item.controlId === controlId) || {};
  const onChange = (obj, callback) => {
    if (isEmpty(obj)) return;
    handleDataChange(controlId, { ...data, ...obj }, callback);
  };

  // 1: 设置，2: 样式， 3: 说明
  const [mode, setMode] = useState(1);
  const allProps = { ...rest, data, info, widgets, mode, queryConfig, onChange: onChange };

  const getContent = () => {
    if (mode === 2) {
      return <StyleContent {...allProps} />;
    } else if (mode === 3) {
      return <ExplainContent {...allProps} />;
    } else {
      return <SettingContent {...allProps} />;
    }
  };

  useEffect(() => {
    if (controlId) {
      setMode(1);
    }
  }, [controlId]);

  const renderSetting = () => {
    if (isEmpty(data)) return <div className="emptyStatus">{_l('没有选中的字段')}</div>;
    if ([17, 18].includes(type)) return <div className="emptyStatus">{_l('日期段控件已下架，不支持配置')}</div>;
    return (
      <Fragment>
        <WidgetIntro {...allProps} setMode={setMode} />
        <ScrollView className="flex">
          <div className="settingContentWrap">{getContent()}</div>
        </ScrollView>
      </Fragment>
    );
  };

  return <SettingWrap id="widgetConfigSettingWrap">{renderSetting()}</SettingWrap>;
}

export default errorBoundary(WidgetSetting);
