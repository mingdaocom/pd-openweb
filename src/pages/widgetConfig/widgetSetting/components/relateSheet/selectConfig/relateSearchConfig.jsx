import React, { Fragment, useState } from 'react';
import update from 'immutability-helper';
import { get, head } from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Dropdown, RadioGroup } from 'ming-ui';
import { FASTFILTER_CONDITION_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/util.js';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import FastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/fastFilterCon';
import { SettingItem } from '../../../../styled';
import { formatControlsToDropdown, getAdvanceSetting } from '../../../../util';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import SelectControl from '../../SelectControl';
import 'rc-trigger/assets/index.css';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

const DISPLAY_OPTIONS = [
  {
    text: _l('所有文本类型字段'),
    value: 0,
  },
  { text: _l('指定字段'), value: 1 },
];

const ConfigWrap = styled.div`
  .infoWrap {
    line-height: 48px;
    padding-left: 12px;
    background-color: #f5f5f5;
  }
  .addFilterControl {
    width: 100%;
    border-radius: 3px;
    line-height: 44px;
    color: #2196f3;
    background: #f8f8f8;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      color: #1780d3;
      background-color: #f5f5f5;
    }
  }

  .conditionItemHeader {
    display: flex;
    align-items: center;
  }
  .ming.Dropdown {
    background-color: transparent;
  }
`;

export default function RelateSearchConfig(props) {
  const { data, controls = [], handleChange } = props;
  const { advancedSetting = {} } = data;
  const [visible, setVisible] = useState(false);
  const searchableControls = formatControlsToDropdown(
    controls.filter(item => TEXT_TYPE_CONTROL.includes(item.type) && /^\w{24}$/.test(item.controlId)),
  );
  const defaultSearchControl =
    get(
      controls.find(item => item.attribute === 1 && TEXT_TYPE_CONTROL.includes(item.type)),
      'controlId',
    ) || get(head(searchableControls), 'value');

  const { showtype, searchtype = '1', searchcontrol = '', clicksearch = '0' } = advancedSetting;
  const searchfilters = getAdvanceSetting(data, 'searchfilters') || [];

  const handleDelete = id => {
    const index = searchfilters.findIndex(item => item.controlId === id);
    if (index > -1) {
      const newValue = update(searchfilters, { $splice: [[index, 1]] });
      handleChange(
        handleAdvancedSettingChange(data, { searchfilters: _.isEmpty(newValue) ? '' : JSON.stringify(newValue) }),
      );
    }
  };

  const isForbidEncry = id => {
    return _.get(
      _.find(controls, i => i.controlId === (id || searchcontrol)),
      'encryId',
    );
  };

  return (
    <ConfigWrap>
      {showtype === '3' && (
        <div className="infoWrap mTop12">
          {_l('当前字段显示方式为：')}
          <span className="Bold">{_l('下拉框；')}</span>
          {_l('只支持通过搜索查询')}
        </div>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('搜索内容')}</div>
        <RadioGroup
          size="middle"
          className="fixedWidth"
          disableTitle={true}
          checkedValue={searchcontrol ? 1 : 0}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            handleChange(
              handleAdvancedSettingChange(data, { searchcontrol: value ? searchcontrol || defaultSearchControl : '' }),
            );
          }}
        />
      </SettingItem>
      {!searchcontrol ? null : (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('搜索字段')}</div>
            <Dropdown
              border
              isAppendToBody
              value={searchcontrol}
              data={searchableControls}
              onChange={value => {
                handleChange(
                  handleAdvancedSettingChange(data, {
                    searchcontrol: value,
                    searchtype: isForbidEncry(value) ? '1' : searchtype,
                  }),
                );
              }}
            />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('搜索方式')}</div>
            <RadioGroup
              checkedValue={searchtype}
              className="fixedWidth"
              data={[
                { value: '1', text: _l('精确搜索') },
                { value: '0', text: _l('模糊搜索'), disabled: isForbidEncry() },
              ]}
              onChange={value => {
                handleChange(handleAdvancedSettingChange(data, { searchtype: value }));
              }}
            />
          </SettingItem>
          {isForbidEncry() && <div className="Gray_9e mTop10 mLeft80">{_l('当前字段已加密，按照精确搜索查询')}</div>}
        </Fragment>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('设置')}</div>
        <Checkbox
          checked={clicksearch === '1'}
          text={_l('在搜索后显示可选记录')}
          onClick={checked => {
            handleChange(handleAdvancedSettingChange(data, { clicksearch: checked ? '0' : '1' }));
          }}
        />
      </SettingItem>
      {showtype !== '3' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('筛选')}</div>
          <div className="subTitle Gray_75">{_l('用户通过以下字段筛选关联记录')}</div>
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
                        handleChange(
                          handleAdvancedSettingChange(data, {
                            searchfilters: JSON.stringify(searchfilters.concat(_.pick(item, ['controlId']))),
                          }),
                        );
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
                  <div className="addFilterControl pointer">
                    <span className="icon-add Font18" />
                    {_l('选择字段')}
                  </div>
                </Trigger>
              );
            }}
            fastFilters={searchfilters}
            worksheetControls={controls}
            onDelete={handleDelete}
            onAdd={item => {
              handleChange(
                handleAdvancedSettingChange(data, { searchfilters: JSON.stringify(searchfilters.concat(item)) }),
              );
            }}
            onSortEnd={newItems => {
              handleChange(handleAdvancedSettingChange(data, { searchfilters: JSON.stringify(newItems) }));
            }}
          />
        </SettingItem>
      )}
    </ConfigWrap>
  );
}
