import React, { useEffect, useState } from 'react';
import { Checkbox, RadioGroup, Dropdown } from 'ming-ui';
import styled from 'styled-components';
import { formatControlsToDropdown } from 'src/pages/widgetConfig/util/index.js';
import { useSetState } from 'react-use';

//可搜索的字段仅支持文本类型字段（文本、号码、邮箱、证件、自动编号、文本组合）
const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

const ConfigWrap = styled.div`
  padding-bottom: 24px;
  .lineBox {
    border-top: 1px solid #dddddd;
    margin: 32px 0;
  }
  .title {
    margin-top: 0 !important;
    font-weight: bold;
    font-size: 13px;
    padding-top: 0;
  }
  .configItem {
    align-items: center;
    margin-top: 24px;
    .title {
      width: 80px;
    }
    .ming RadioGroup {
      line-height: 36px;
    }
  }
  .settingTitle {
    font-weight: 400;
    font-size: 13px;
    margin-top: 24px;
  }
  .ming.Dropdown {
    background-color: transparent;
  }
`;

export default function SearchConfig(props) {
  const { data, onChange, controls = [] } = props;

  const searchableControls = formatControlsToDropdown(
    controls.filter(item => TEXT_TYPE_CONTROL.includes(item.type) && /^\w{24}$/.test(item.controlId)),
  );
  const [{ searchcontrol, searchtype, clicksearch }, setState] = useSetState({
    searchtype: data.searchtype || '0',
    searchcontrol: data.searchcontrol,
    clicksearch: data.clicksearch || '0',
  });
  useEffect(() => {
    const { data, onChange, controls = [] } = props;
    setState({
      searchtype: data.searchtype || '0',
      searchcontrol: data.searchcontrol,
      clicksearch: data.clicksearch || '0',
    });
  }, [props]);
  return (
    <ConfigWrap>
      <div className="lineBox"></div>
      <div className="title pTop0">{_l('下拉框搜索设置')}</div>
      <div className="settingTitle">{_l('搜索字段')}</div>
      <Dropdown
        border
        isAppendToBody
        value={searchcontrol}
        data={searchableControls}
        cancelAble
        onChange={value => {
          if (value == searchcontrol) {
            return;
          }
          onChange({ searchcontrol: value });
        }}
      />
      {searchcontrol && (
        <div className="configItem">
          <div className="settingTitle">{_l('搜索方式')}</div>
          <RadioGroup
            checkedValue={searchtype}
            className="mTop8"
            data={[
              { value: '1', text: _l('精确搜索') },
              { value: '0', text: _l('模糊搜索') },
            ]}
            onChange={value => {
              if (value == searchtype) {
                return;
              }
              onChange({ searchtype: value });
            }}
          />
        </div>
      )}
      <div className="configItem">
        <Checkbox
          className="mTop8"
          checked={clicksearch === '1'}
          text={_l('在搜索后显示可选记录')}
          onClick={checked => {
            onChange({ clicksearch: checked ? '0' : '1' });
          }}
        />
      </div>
    </ConfigWrap>
  );
}
