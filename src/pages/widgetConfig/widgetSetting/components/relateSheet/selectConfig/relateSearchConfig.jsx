import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import update from 'immutability-helper';
import { get, head } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Popover, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import FastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/fastFilterCon';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { formatControlsToDropdown } from 'src/utils/domain/control/filters';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/utils/domain/worksheet/constants';
import { FASTFILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/fastFilter';
import { SettingItem } from '../../../../styled';
import SelectControl from '../../SelectControl';
import { SectionItem } from '../../SplitLineConfig/style';

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];
const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

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
    background-color: var(--color-background-secondary);
  }
  .addFilterControl {
    width: 100%;
    border-radius: 3px;
    line-height: 44px;
    color: var(--color-primary);
    background: var(--color-background-secondary);
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      color: var(--color-link-hover);
      background-color: var(--color-background-hover);
    }
  }
  .Width105 {
    width: 105px;
  }

  .conditionItemHeader {
    display: flex;
    align-items: center;
  }
  .filterDesc {
    line-height: 44px;
    background: var(--color-background-secondary);
    padding: 0 12px;
    color: var(--color-text-title);
    margin: 8px 0;
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

const renderViewOption = ({ data: item }) => renderViewMenu(item);

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
  const showFastFilter = isDropdown ? advancedSetting.openfastfilters || '0' : '1';
  const fastViews = views.filter(f => !_.isEmpty(f.fastFilters) && f.viewId !== f.worksheetId);
  const currentFastView = _.find(fastViews, f => f.viewId === fastfiltersview);
  const fastViewOptions = fastViews.map(i => ({ ...i, label: i.name, value: i.viewId }));

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
          <Radio.Group
            size="middle"
            className="fixedWidth"
            value={searchcontrol ? 1 : 0}
            options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

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
              <div className="label Width105">{_l('搜索字段')}</div>
              <Select
                className="flex"
                value={searchcontrol}
                options={searchableControls}
                fieldNames={SELECT_FIELD_NAMES}
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
              <Radio.Group
                value={searchtype}
                className="fixedWidth"
                options={[
                  { value: '1', text: _l('精确搜索') },
                  { value: '0', text: _l('模糊搜索'), disabled: isForbidEncry() },
                ].map(({ text, ...option }) => ({ ...option, label: text }))}
                onChange={event => {
                  const value = event.target.value;

                  handleChange(
                    handleAdvancedSettingChange(data, {
                      searchtype: value,
                    }),
                  );
                }}
              />
            </SectionItem>
            {isForbidEncry() && (
              <div className="textTertiary mTop10 mLeft80">{_l('当前字段已加密，按照精确搜索查询')}</div>
            )}
          </Fragment>
        )}
        <SectionItem>
          <div className="label Width105">{_l('其他')}</div>
          <Checkbox
            checked={clicksearch === '1'}
            onChange={event => {
              handleChange(
                handleAdvancedSettingChange(data, {
                  clicksearch: !event.target.checked ? '0' : '1',
                }),
              );
            }}
          >
            {_l('在搜索后显示可选记录')}
          </Checkbox>
        </SectionItem>
      </SettingItem>

      <SettingItem>
        <div className="settingItemTitle">{_l('筛选')}</div>
        {isDropdown && (
          <div className="filterDesc">
            {_l('设置用户在使用弹层输入时，可以筛选的字段 。（此配置需要 下拉框设置-辅助输入方式：设为弹层选择）')}
          </div>
        )}
        {showFastFilter === '1' && (
          <Fragment>
            <SectionItem>
              <div className="label Width120">{_l('筛选设置')}</div>
              <Radio.Group
                value={fastfilterstype}
                className="fixedWidth"
                options={[
                  { value: '1', text: _l('筛选指定字段') },
                  {
                    value: '2',
                    text: (
                      <span>
                        {_l('使用视图的快速筛选')}
                        <Tooltip title={_l('只有能访问该视图的用户，才能看到并使用配置的快速筛选')}>
                          <Icon icon="help" className="Font16 textDisabled mLeft4" />
                        </Tooltip>
                      </span>
                    ),
                  },
                ].map(({ text, ...option }) => ({ ...option, label: text }))}
                onChange={event => {
                  const value = event.target.value;

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

                  handleChange(
                    handleAdvancedSettingChange(data, {
                      fastfilterstype: value,
                      fastfiltersview: '',
                    }),
                  );
                }}
              />
            </SectionItem>
            {fastfilterstype === '1' ? (
              <div className="mTop16" style={{ paddingLeft: 105 }}>
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
                              handleChange(
                                handleAdvancedSettingChange(data, {
                                  searchfilters: JSON.stringify(searchfilters.concat(_.pick(item, ['controlId']))),
                                }),
                              );
                            }}
                          />
                        }
                        placement="bottomLeft"
                        noPadding
                        styles={{ container: { width: 280 } }}
                      >
                        <div className="addFilterControl pointer">
                          <span className="icon-add Font18" />
                          {_l('选择字段')}
                        </div>
                      </Popover>
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
              <div className="mTop16" style={{ paddingLeft: 105 }}>
                <Select
                  className="w100"
                  value={fastfiltersview || undefined}
                  options={fastViewOptions}
                  placeholder={_l('请选择')}
                  labelRender={() => {
                    if (!currentFastView) return <span className="Red">{_l('已删除')}</span>;
                    return renderViewMenu(currentFastView, true);
                  }}
                  optionRender={renderViewOption}
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
