import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Drawer } from 'antd';
import { Dropdown, RadioGroup, Switch } from 'ming-ui';
import { selectRecord } from 'src/components/recordCardListDialog';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import CustomReference from '../CustomWidget/CustomReference';
import { find, get, pick } from 'lodash';
import { getFormData } from './util';
import { WIDGETS_TO_API_TYPE_ENUM } from '../../../config/widget';

const Con = styled.div`
  position: relative;
  padding: 16px 20px;
  .title {
    font-size: 14px;
    color: #151515;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .sectionTitle {
    font-size: 13px;
    color: #757575;
    margin-bottom: 8px;
  }
  .envRadio {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .name {
      color: #515151;
    }
    .RadioGroup {
      flex: 1;
      justify-content: flex-end;
    }
  }
`;

const LoadMockDataBtn = styled.div`
  font-size: 13px;
  color: #757575;
  cursor: pointer;
  display: inline-flex;
  height: 24px;
  justify-content: center;
  align-items: center;
  color: #2196f3;
`;

const LoadedMockDataBtn = styled.div`
  font-size: 13px;
  color: #757575;
  height: 24px;
  display: flex;
  align-items: center;
  flex: 1;
  .recordName {
    max-width: 200px;
    overflow: hidden;
    color: #151515;
    margin-left: 16px;
  }
  .clearMockData {
    color: #2196f3;
    cursor: pointer;
    margin-left: 16px;
  }
`;

const ShowAllEnvBtn = styled.div`
  margin-left: 20px;
  font-size: 13px;
  color: #2196f3;
  display: inline-block;
  cursor: pointer;
  i {
    margin-right: 4px;
  }
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .title {
    font-size: 17px;
    color: #151515;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .sectionTitle {
    font-size: 13px;
    color: #757575;
    margin-bottom: 20px;
  }
  .envValueArea {
    background-color: #f7f7f7;
    padding: 12px 15px;
    border-radius: 5px;
    white-space: pre-wrap;
  }
  .envSecTitle {
    font-size: 13px;
    color: #151515;
    margin: 8px 0;
  }
  .close {
    position: absolute;
    right: 15px;
    top: 15px;
    font-size: 22px;
    color: #757575;
    cursor: pointer;
  }
  .content {
    position: relative;
    flex: 1;
    overflow-y: auto;
    margin: 0 -20px;
    padding: 0 20px;
  }
`;

const SHOW_TYPE = {
  ORIGIN: 1, // stringify 显示完整值 formData, env
  REFERENCE: 2, // 引用字段
  CURRENT: 3, // 当前字段  // currentControl
};

function getValueSaveExample(type) {
  switch (type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      return `"value to update"`;
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
      return `10000`;
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      return `"2024-01-01"`;
    case WIDGETS_TO_API_TYPE_ENUM.TIME:
      return `"12:00:00"`;
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
      return `"${JSON.stringify(['xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'])}"`;
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
      return `"${JSON.stringify([{ sid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'record name' }])}"`;
    default:
      return '';
  }
}

function getValueToShow({ formData, reference, control, envIsMobile, envIsDisabled } = {}) {
  const isRefValue = control.type === 54;
  const result = [
    {
      text: _l('currentControl[当前字段控件]'),
      value: 'currentControl',
      type: SHOW_TYPE.CURRENT,
      valueToShow: '-保存值格式-',
    },
    {
      text: _l('formData[记录字段值]'),
      value: 'formData',
      type: SHOW_TYPE.ORIGIN,
      valueToShow: JSON.stringify(
        formData.reduce((acc, item) => {
          acc[item.controlId] = pick(item, ['controlId', 'controlName', 'value', 'options']);
          return acc;
        }, {}),
        null,
        2,
      ),
    },
  ];
  if (!isRefValue) {
    result.push({
      text: _l('value[字段值]'),
      value: 'value',
      type: SHOW_TYPE.STRING,
      valueToShow: get(find(formData, { controlId: control.controlId }), 'value') || '',
    });
  }
  const envValue = { isMobile: envIsMobile, isDisabled: envIsDisabled };
  reference.forEach(refItem => {
    const refControl = find(formData, { controlId: refItem.cid });
    if (refControl) {
      envValue[refItem.name || 'undefined'] = refItem.cid;
      result.push({
        text: `env.${refItem.name || 'undefined'}[${refControl.controlName}]`,
        value: refControl.controlId,
        valueToShow: refControl.controlId,
        type: SHOW_TYPE.REFERENCE,
      });
    }
  });
  result.push({
    text: _l('env[环境参数]'),
    value: 'env',
    valueToShow: JSON.stringify({ isMobile: envIsMobile, isDisabled: envIsDisabled, ...envValue }, null, 2),
    type: SHOW_TYPE.ORIGIN,
  });
  return result;
}

function getEnvValueForShow({ control, valueToShow, selectedEnv, formData } = {}) {
  let showItem = find(valueToShow, { value: selectedEnv });
  if (!showItem) {
    return '';
  }
  let matchControl;
  switch (showItem.type) {
    case SHOW_TYPE.ORIGIN:
      return <div className="envValueArea mTop18 flex">{showItem.valueToShow}</div>;
    case SHOW_TYPE.REFERENCE:
      matchControl = find(formData, { controlId: showItem.value });
      return (
        <Fragment>
          <div className="envSecTitle">{_l('值')}</div>
          <div className="envValueArea">{showItem.valueToShow}</div>
          <div className="envSecTitle">{_l('引用字段信息')}</div>
          <div className="envValueArea flex">
            {JSON.stringify(pick(matchControl, ['controlId', 'controlName', 'options', 'value']), null, 2)}
          </div>
        </Fragment>
      );
    case SHOW_TYPE.CURRENT:
      matchControl = find(formData, { controlId: control.controlId });
      return (
        <Fragment>
          <div className="envSecTitle">{_l('字段信息')}</div>
          <div className="envValueArea flex">
            {JSON.stringify(pick(matchControl, ['controlId', 'controlName', 'options', 'value']), null, 2)}
          </div>
          <div className="envSecTitle">{_l('保存值格式')}</div>
          <div className="envValueArea flex">{getValueSaveExample(control.type)}</div>
        </Fragment>
      );
    case SHOW_TYPE.STRING:
      return <div className="envValueArea mTop18">"{showItem.valueToShow}"</div>;
    default:
      return '';
  }
}
export default function EnvConfig(props) {
  const {
    className,
    worksheetId,
    control,
    envIsMobile = false,
    envIsDisabled = false,
    controls = [],
    rest = {},
    reference = [],
    setReference = _.noop,
    mockRecord,
    setMockRecord,
    setEnvIsMobile,
    setEnvIsDisabled,
    onUpdate,
  } = props;
  const ref = useRef(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formData = getFormData(controls, mockRecord);
  const valueToShow = getValueToShow({ formData, reference, control, envIsMobile, envIsDisabled });
  const [selectedEnv, setSelectedEnv] = useState(get(valueToShow, '0.value'));
  return (
    <Con className={className} ref={ref}>
      <div className="title">{_l('引用其他字段')}</div>
      <div className="sectionTitle">
        {_l(
          '引用后可以在代码中通过环境参数 "env.变量名" 获取其他字段的控件 id，再从表单参数 formData 中获取字段的值和配置',
        )}
        <ShowAllEnvBtn onClick={() => setDrawerVisible(true)}>{_l('查看表单参数')}</ShowAllEnvBtn>
      </div>
      <CustomReference
        {...rest}
        className="mTop0"
        reference={reference}
        envValueAvailable={!!mockRecord}
        handleChange={value => {
          setReference(value);
          onUpdate(value);
        }}
        onEnvValueClick={id => {
          setSelectedEnv(id);
          setDrawerVisible(true);
        }}
      />
      <div className="title mTop12">{_l('模拟数据')}</div>
      <div className="sectionTitle">{_l('选择一条已有记录，模拟表单字段有数据的情况')}</div>
      {!mockRecord ? (
        <LoadMockDataBtn
          onClick={() =>
            selectRecord({
              canSelectAll: false,
              pageSize: 25,
              multiple: false,
              relateSheetId: worksheetId,
              onOk: selectedRecords => {
                setMockRecord(selectedRecords[0]);
              },
            })
          }
        >
          {_l('选择记录')}
        </LoadMockDataBtn>
      ) : (
        <LoadedMockDataBtn>
          {_l('已加载记录')}
          <div className="recordName ellipsis">{getTitleTextFromControls(controls, mockRecord)}</div>
          <span className="clearMockData" onClick={() => setMockRecord(undefined)}>
            {_l('清除')}
          </span>
        </LoadedMockDataBtn>
      )}
      <div className="sectionTitle mTop10">{_l('可从环境参数 "env" 中获取本字段控件是否处于移动端环境或只读状态')}</div>
      {[
        {
          key: 'mobile',
          name: _l('模拟移动端(env.isMobile)'),
          value: envIsMobile,
          onChange: setEnvIsMobile,
        },
        {
          key: 'disabled',
          name: _l('模拟只读(env.isDisabled)'),
          value: envIsDisabled,
          onChange: setEnvIsDisabled,
        },
      ].map((item, i) => (
        <div className="flexCenter mBottom10" key={i}>
          <Switch
            size="small"
            checked={item.value === true}
            onClick={checked => {
              if (item.key === 'mobile') {
                setEnvIsMobile(!checked);
              } else if (item.key === 'disabled') {
                setEnvIsDisabled(!checked);
              }
            }}
          />
          <div className="InlineBlock mLeft12">{item.name}</div>
        </div>
      ))}
      <Drawer
        bodyStyle={{ padding: 0 }}
        width={490}
        title={null}
        visible={drawerVisible}
        destroyOnClose={true}
        mask={false}
        closable={null}
        placement="right"
      >
        <DrawerContent>
          <div className="title">{_l('查看变量值')}</div>
          <div className="sectionTitle">{_l('查看字段环境变量与模拟加载记录的值')}</div>
          <Dropdown
            style={{ width: 300 }}
            menuStyle={{ width: 300 }}
            border
            defaultValue={selectedEnv}
            data={valueToShow.map(item => ({ text: item.text, value: item.value }))}
            onChange={value => setSelectedEnv(value)}
          />
          <div className="content">{getEnvValueForShow({ control, valueToShow, selectedEnv, formData })}</div>
          <i className="icon icon-close close" onClick={() => setDrawerVisible(false)}></i>
        </DrawerContent>
      </Drawer>
    </Con>
  );
}

EnvConfig.propTypes = {
  className: PropTypes.string,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  reference: PropTypes.arrayOf(PropTypes.shape({})),
  control: PropTypes.shape({}),
  worksheetId: PropTypes.string,
  envIsMobile: PropTypes.bool,
  envIsDisabled: PropTypes.bool,
  setEnvIsMobile: PropTypes.func,
  setEnvIsDisabled: PropTypes.func,
};
