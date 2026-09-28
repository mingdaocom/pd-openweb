import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import update from 'immutability-helper';
import { get, head } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Modal, Popover, Radio, Select } from 'ming-ui/antd-components';
import FastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/fastFilterCon';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { formatControlsToDropdown } from 'src/utils/domain/control/filters';
import { FASTFILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/fastFilter';
import { SettingItem } from '../../../styled';
import SelectControl from '../SelectControl';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];
const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const ConfigWrap = styled.div`
  .infoWrap {
    line-height: 48px;
    padding-left: 12px;
    background-color: var(--color-background-secondary);
  }
  .addFilterControl {
    width: 120px;
    border-radius: 3px;
    padding: 0 12px;
    line-height: 32px;
    color: var(--color-primary);
    font-weight: bold;
    &:hover {
      color: var(--color-link-hover);
      background-color: var(--color-background-hover);
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
`;

export default function ApiSearchConfig(props) {
  const { data, onChange, onClose, controls = [], title } = props;
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

  const hideConfig = _.includes([35], data.type);

  return (
    <Modal
      open={true}
      mask={{ closable: true }}
      keyboard
      title={<span className="Bold">{title || _l('查询设置')}</span>}
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
          <Select
            className="w100"
            value={searchcontrol}
            options={searchableControls}
            fieldNames={SELECT_FIELD_NAMES}
            onChange={value => {
              setState({ searchcontrol: value, searchtype: isForbidEncry(value) ? '1' : searchtype });
            }}
          />
        </SettingItem>
        <div className="configItem">
          <div className="title">{_l('搜索方式')}</div>
          <Radio.Group
            value={searchtype}
            options={[
              { value: '1', text: _l('精确搜索') },
              { value: '0', text: _l('模糊搜索'), disabled: isForbidEncry() },
            ].map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              setState({
                searchtype: value,
              });
            }}
          />
        </div>
        {isForbidEncry() && <div className="textTertiary mTop10 mLeft80">{_l('当前字段已加密，按照精确搜索查询')}</div>}
        {hideConfig ? null : (
          <Fragment>
            <div className="configItem">
              <div className="title">{_l('设置')}</div>
              <Checkbox
                checked={clicksearch === '1'}
                onChange={event => {
                  setState({
                    clicksearch: !event.target.checked ? '0' : '1',
                  });
                }}
              >
                {_l('在搜索后显示可选记录')}
              </Checkbox>
            </div>
            {showtype !== '3' && (
              <SettingItem className="mTop36">
                <div className="settingItemTitle">{_l('筛选')}</div>
                <div className="subTitle textTertiary">{_l('用户通过以下字段筛选关联记录')}</div>
                <FastFilter
                  from="fastFilter"
                  className="relateSheetSearchConfig"
                  customAdd={() => {
                    return (
                      <Popover
                        trigger="click"
                        open={visible}
                        onOpenChange={visible => {
                          setVisible(visible);
                        }}
                        content={
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
                        placement="bottomLeft"
                        noPadding
                        styles={{ container: { width: 280 } }}
                      >
                        <div className="addFilterControl pointer">+ {_l('添加筛选字段')}</div>
                      </Popover>
                    );
                  }}
                  fastFilters={searchfilters}
                  worksheetControls={controls}
                  onDelete={handleDelete}
                  onAdd={item => {
                    setState({ searchfilters: searchfilters.concat(item) });
                  }}
                  onSortEnd={newItems => {
                    setState({ searchfilters: newItems });
                  }}
                />
              </SettingItem>
            )}
          </Fragment>
        )}
      </ConfigWrap>
    </Modal>
  );
}
