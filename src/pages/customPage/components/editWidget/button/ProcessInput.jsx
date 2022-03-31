import React, { Fragment, useState, useRef } from 'react';
import { Dropdown } from 'antd';
import { Menu, MenuItem, TagTextarea } from 'ming-ui';
import styled from 'styled-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const BtnParamWrap = styled.div`
  align-items: flex-start;
  .tagInputareaIuput {
    border-radius: 3px 0 0 3px !important;
  }
  .CodeMirror-sizer {
    line-height: 26px !important;
  }
  .CodeMirror-lines {
    padding: 3px 0 !important;
  }
  .columnTagCon {
    padding: 0px 4px !important;
  }
  .selectField {
    height: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-left: none;
    border-radius: 0 3px 3px 0;
    display: flex;
    align-items: center;
    background: #fff;
  }
`;

const ControlTag = styled.div`
  font-size: 12px;
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  &.invalid {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    border-color: #f44336;
  }
`;

const OPERAION_FLOW_PARAM = [
  { value: 'codeResult', text: _l('扫码结果') },
  { value: 'triggerUser', text: _l('触发者') },
  { value: 'triggerTime', text: _l('触发时间') },
];

export default function ProcessInput(props) {
  const { item, inputData, action, onChange } = props;
  const { value = [], type } = inputData;
  const tagTextareaValue = value.map(item => item.cid ? `$${item.cid}$` : item.staticValue).join('');
  const tagtextarea = useRef(null);
  const isMember = type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER;
  return (
    <div className="settingItem">
      <div className="settingTitle Normal">
        {item.text}
        {item.required && <i className="Red">*</i>}
      </div>
      <BtnParamWrap className="flexRow w100">
        <div className="flex">
          <TagTextarea
            mode={2}
            defaultValue={tagTextareaValue}
            getRef={el => {
              tagtextarea.current = el;
            }}
            renderTag={(id, options) => {
              const { text } = _.find(OPERAION_FLOW_PARAM, { value: id });
              return (
                <ControlTag className="flexRow valignWrapper">
                  {text}
                </ControlTag>
              );
            }}
            onChange={(err, value, obj) => {
              if (err) return;
              const defaultValue = _.filter(value.split('$'), v => !_.isEmpty(v));
              const defsource = defaultValue.map(item => {
                const param = _.find(OPERAION_FLOW_PARAM, { value: item });
                if (param) {
                  return { cid: param.value, staticValue: '' }
                } else {
                  return { cid: '', staticValue: item }
                }
              });
              onChange(isMember ? defsource.filter(item => item.cid) : defsource);
            }}
          />
        </div>
        <Dropdown
          trigger={'click'}
          placement={'bottomRight'}
          overlay={
            <div style={{ width: '302px' }}>
              <Menu style={{ position: 'inherit' }}>
                {OPERAION_FLOW_PARAM.filter(item => {
                  if (
                    (action === 6 && item.value == 'codeResult') ||
                    (isMember && item.value == 'triggerTime')
                  ) {
                    return false;
                  }
                  return true;
                }).map(item => (
                  <MenuItem
                    key={item.value}
                    onClick={() => {
                      tagtextarea.current.insertColumnTag(item.value);
                    }}
                  >
                    {item.text}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          }>
          <div data-tip={_l('使用动态参数')} className="selectField pointer tip-top-left">
            <i className="icon-workflow_other Font22 "></i>
          </div>
        </Dropdown>
      </BtnParamWrap>
    </div>
  );
}