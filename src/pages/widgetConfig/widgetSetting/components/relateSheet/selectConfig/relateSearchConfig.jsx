import React, { Fragment, useState } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import update from 'immutability-helper';
import { get, head } from 'lodash';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon, RadioGroup, Switch } from 'ming-ui';
import { FASTFILTER_CONDITION_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/util.js';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import FastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/fastFilterCon';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';
import { SettingItem } from '../../../../styled';
import { formatControlsToDropdown, getAdvanceSetting } from '../../../../util';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import SelectControl from '../../SelectControl';
import { SectionItem } from '../../SplitLineConfig/style';
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
    color: #1677ff;
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

const renderViewMenu = (item, isDisplay) => {
  const viewType = VIEW_DISPLAY_TYPE[item.viewType];
  const { color, icon } = _.find(VIEW_TYPE_ICON, v => v.id === viewType) || {};
  return (
    <div className="flexCenter flexRow Relative">
      <Icon style={{ color, fontSize: '16px', marginRight: '6px', left: 0 }} icon={icon} />
      <div className={cx('flex overflow_ellipsis Bold', { pLeft24: !isDisplay })}>{item.name}</div>
    </div>
  );
};

export default function RelateSearchConfig(props) {
  const { data, controls = [], views = [], handleChange } = props;
  const { advancedSetting = {}, viewId } = data;
  const [visible, setVisible] = useState(false);
  const searchableControls = formatControlsToDropdown(
    controls.filter(item => TEXT_TYPE_CONTROL.includes(item.type) && /^\w{24}$/.test(item.controlId)),
  );
  const defaultSearchControl =
    get(
      controls.find(item => item.attribute === 1 && TEXT_TYPE_CONTROL.includes(item.type)),
      'controlId',
    ) || get(head(searchableControls), 'value');

  const {
    showtype,
    searchtype = '1',
    searchcontrol = '',
    clicksearch = '0',
    fastfilterstype = '1',
    fastfiltersview,
  } = advancedSetting;
  const searchfilters = getAdvanceSetting(data, 'searchfilters') || [];
  const isDropdown = showtype === '3';
  const openfastfilters = advancedSetting.openfastfilters || (isDropdown ? '0' : '1');
  const fastViews = views.filter(f => !_.isEmpty(f.fastFilters) && f.viewId !== f.worksheetId);

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
      <SettingItem>
        <div className="settingItemTitle">{_l('搜索')}</div>
        <SectionItem>
          <div className="label Width120">{_l('搜索内容')}</div>
          <RadioGroup
            size="middle"
            className="fixedWidth"
            disableTitle={true}
            checkedValue={searchcontrol ? 1 : 0}
            data={DISPLAY_OPTIONS}
            onChange={value => {
              handleChange(
                handleAdvancedSettingChange(data, {
                  searchcontrol: value ? searchcontrol || defaultSearchControl : '',
                }),
              );
            }}
          />
        </SectionItem>
        {!searchcontrol ? null : (
          <Fragment>
            <SectionItem>
              <div className="label Width120">{_l('搜索字段')}</div>
              <Dropdown
                border
                className="flex"
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
            </SectionItem>
            <SectionItem>
              <div className="label Width120">{_l('搜索方式')}</div>
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
            </SectionItem>
            {isForbidEncry() && <div className="Gray_9e mTop10 mLeft80">{_l('当前字段已加密，按照精确搜索查询')}</div>}
          </Fragment>
        )}
        <SectionItem>
          <div className="label Width120">{_l('其他')}</div>
          <Checkbox
            checked={clicksearch === '1'}
            text={_l('在搜索后显示可选记录')}
            onClick={checked => {
              handleChange(handleAdvancedSettingChange(data, { clicksearch: checked ? '0' : '1' }));
            }}
          />
        </SectionItem>
      </SettingItem>

      <SettingItem>
        <div className="settingItemTitle">{isDropdown ? _l('弹窗选择方式') : _l('筛选')}</div>
        <div className="subTitle Gray_75">
          {isDropdown
            ? _l('使用弹窗关联记录，可以配置的筛选器过滤记录并设置弹窗中的显示字段')
            : _l('用户通过配置的筛选器过滤记录')}
        </div>
        <div className="flexCenter flexRow">
          <Switch
            checked={openfastfilters === '1'}
            onClick={value =>
              handleChange(
                handleAdvancedSettingChange(data, {
                  openfastfilters: value ? '0' : '1',
                  searchfilters: '',
                  fastfiltersview: '',
                  fastfilterstype: '1',
                  chooseshow: '0',
                  ...(data.enumDefault === 1 && showtype === '3' ? {} : { chooseshowids: '' }),
                }),
              )
            }
          />
          <span className="mLeft6">{_l('启用')}</span>
        </div>
        {openfastfilters === '1' && (
          <Fragment>
            <SectionItem>
              <div className="label Width120">{_l('设置')}</div>
              <RadioGroup
                checkedValue={fastfilterstype}
                className="fixedWidth"
                disableTitle={true}
                data={[
                  { value: '1', text: _l('筛选指定字段') },
                  {
                    value: '2',
                    text: (
                      <span>
                        {_l('使用视图的快速筛选')}
                        <Tooltip title={_l('只有能访问该视图的用户，才能看到并使用配置的快速筛选')}>
                          <Icon icon="help" className="Font16 Gray_bd mLeft4" />
                        </Tooltip>
                      </span>
                    ),
                  },
                ]}
                onChange={value => {
                  if (value === fastfilterstype) return;
                  if (value === '2') {
                    handleChange(
                      handleAdvancedSettingChange(data, {
                        fastfilterstype: value,
                        searchfilters: '',
                        fastfiltersview: _.find(fastViews, f => f.viewId === viewId) ? viewId : '',
                      }),
                    );
                    return;
                  }
                  handleChange(handleAdvancedSettingChange(data, { fastfilterstype: value, fastfiltersview: '' }));
                }}
              />
            </SectionItem>
            {fastfilterstype === '1' ? (
              <div className="mTop16">
                <div className={cx({ mBottom8: !searchfilters.length })}>{_l('筛选字段')}</div>
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
              </div>
            ) : (
              <div className="mTop16">
                <div className="mBottom8">{_l('视图')}</div>
                <Dropdown
                  border
                  className="w100"
                  isAppendToBody
                  value={fastfiltersview || undefined}
                  data={fastViews.map(i => ({ text: i.name, value: i.viewId, ..._.pick(i, ['viewType', 'name']) }))}
                  renderTitle={({ value } = {}) => {
                    const currenView = _.find(fastViews, f => f.viewId === value);
                    if (!fastfiltersview) return <span className="Gray_bd">{_l('请选择')}</span>;
                    if (fastfiltersview && !currenView) return <span className="Red">{_l('已删除')}</span>;
                    return renderViewMenu(currenView, true);
                  }}
                  renderItem={renderViewMenu}
                  onChange={value => handleChange(handleAdvancedSettingChange(data, { fastfiltersview: value }))}
                />
              </div>
            )}
          </Fragment>
        )}
      </SettingItem>
    </ConfigWrap>
  );
}
