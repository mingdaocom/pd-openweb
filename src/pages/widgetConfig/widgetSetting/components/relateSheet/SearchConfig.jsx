import React, { useState } from 'react';
import { Menu, MenuItem, Checkbox, RadioGroup, Dialog, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { arrayMove } from 'react-sortable-hoc';
import styled from 'styled-components';
import update from 'immutability-helper';
import SelectControl from '../SelectControl';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { get, head } from 'lodash';
import FastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/fastFilterCon';
import { FASTFILTER_CONDITION_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/util.js';
import { formatControlsToDropdown, getAdvanceSetting } from '../../../util';
import { SettingItem } from '../../../styled';
import { handleAdvancedSettingChange } from '../../../util/setting';
import { useSetState } from 'react-use';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

const ConfigWrap = styled.div`
  .infoWrap {
    line-height: 48px;
    padding-left: 12px;
    background-color: #f5f5f5;
  }
  .addFilterControl {
    width: 120px;
    border-radius: 3px;
    padding: 0 12px;
    line-height: 32px;
    color: #2196f3;
    font-weight: bold;
    &:hover {
      color: #1780d3;
      background-color: #f5f5f5;
    }
  }
  .configItem {
    display: flex;
    align-items: center;
    margin-top: 24px;
    .title {
      width: 80px;
    }
  }
  .conditionItemHeader {
    display: flex;
    align-items: center;
  }
  .ming.Dropdown {
    background-color: transparent;
  }
  .relateSheetSearchConfig {
  }
`;

export default function ApiSearchConfig(props) {
  const { data, onChange, onClose, controls = [] } = props;
  const [visible, setVisible] = useState(false);

  const searchableControls = formatControlsToDropdown(
    controls.filter(item => TEXT_TYPE_CONTROL.includes(item.type) && /^\w{24}$/.test(item.controlId)),
  );
  const defaultSearchControl =
    get(
      controls.find(item => item.attribute === 1 && TEXT_TYPE_CONTROL.includes(item.type)),
      'controlId',
    ) || get(head(searchableControls), 'value');

  const config = getAdvanceSetting(data);
  const { showtype } = config;

  const [{ searchfilters, searchcontrol, searchtype, clicksearch }, setState] = useSetState({
    searchtype: config.searchtype || '1',
    searchcontrol: config.searchcontrol || defaultSearchControl,
    clicksearch: config.clicksearch || '0',
    searchfilters: getAdvanceSetting(data, 'searchfilters') || [],
  });

  const handleDelete = id => {
    const index = searchfilters.findIndex(item => item.controlId === id);
    if (index > -1) {
      setState({ searchfilters: update(searchfilters, { $splice: [[index, 1]] }) });
    }
  };

  const isForbidEncry = id => {
    return _.get(
      _.find(controls, i => i.controlId === (id || searchcontrol)),
      'encryId',
    );
  };

  return (
    <Dialog
      visible={true}
      title={<span className="Bold">{_l('查询设置')}</span>}
      width={560}
      onCancel={onClose}
      onOk={() => {
        onChange(
          handleAdvancedSettingChange(data, {
            searchtype,
            searchcontrol,
            clicksearch,
            searchfilters: JSON.stringify(searchfilters),
          }),
        );
        onClose();
      }}
    >
      <ConfigWrap>
        {showtype === '3' && (
          <div className="infoWrap">
            {_l('当前字段显示方式为：')}
            <span className="Bold">{_l('下拉框；')}</span>
            {_l('只支持通过搜索查询')}
          </div>
        )}
        <SettingItem className="mTop8">
          <div className="settingItemTitle Bold">{_l('搜索')}</div>
          <Dropdown
            border
            isAppendToBody
            value={searchcontrol}
            data={searchableControls}
            onChange={value => {
              setState({ searchcontrol: value, searchtype: isForbidEncry(value) ? '1' : searchtype });
            }}
          />
        </SettingItem>
        <div className="configItem">
          <div className="title">{_l('搜索方式')}</div>
          <RadioGroup
            checkedValue={searchtype}
            data={[
              { value: '1', text: _l('精确搜索') },
              { value: '0', text: _l('模糊搜索'), disabled: isForbidEncry() },
            ]}
            onChange={value => {
              setState({ searchtype: value });
            }}
          />
        </div>
        {isForbidEncry() && <div className="Gray_9e mTop10 mLeft80">{_l('当前字段已加密，按照精确搜索查询')}</div>}
        <div className="configItem">
          <div className="title">{_l('设置')}</div>
          <Checkbox
            checked={clicksearch === '1'}
            text={_l('在搜索后显示可选记录')}
            onClick={checked => {
              setState({ clicksearch: checked ? '0' : '1' });
            }}
          />
        </div>
        {showtype !== '3' && (
          <SettingItem className="mTop36">
            <div className="settingItemTitle">{_l('筛选')}</div>
            <div className="subTitle Gray_9e">{_l('用户通过以下字段筛选关联记录')}</div>
            <FastFilter
              from="fastFilter"
              className="relateSheetSearchConfig"
              customAdd={() => {
                return (
                  <Trigger
                    action={['click']}
                    popupVisible={visible}
                    onPopupVisibleChange={visible => {
                      setVisible(visible);
                    }}
                    popupStyle={{ width: 280 }}
                    popup={
                      <SelectControl
                        list={filterOnlyShowField(controls).filter(({ type, sourceControlType, controlId }) => {
                          const ids = searchfilters.map(({ controlId }) => controlId);
                          return (
                            _.includes(FASTFILTER_CONDITION_TYPE, type === 30 ? sourceControlType : type) &&
                            !ids.includes(controlId)
                          );
                        })}
                        onClick={item => {
                          setState({ searchfilters: searchfilters.concat(_.pick(item, ['controlId'])) });
                        }}
                      />
                    }
                    popupAlign={{
                      points: ['tl', 'bl'],
                      offset: [0, 3],
                      overflow: {
                        adjustX: true,
                        adjustY: true,
                      },
                    }}
                  >
                    <div className="addFilterControl pointer">+ {_l('添加筛选字段')}</div>
                  </Trigger>
                );
              }}
              fastFilters={searchfilters}
              worksheetControls={controls}
              onDelete={handleDelete}
              onAdd={item => {
                setState({ searchfilters: searchfilters.concat(item) });
              }}
              onSortEnd={({ oldIndex, newIndex }) => {
                setState({ searchfilters: arrayMove(searchfilters, oldIndex, newIndex) });
              }}
            />
          </SettingItem>
        )}
      </ConfigWrap>
    </Dialog>
  );
}
