import React, { useEffect, Fragment } from 'react';
import { useSetState } from 'react-use';
import { get, isEmpty } from 'lodash';
import { RadioGroup, Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import update from 'immutability-helper';
import styled from 'styled-components';
import cx from 'classnames';
import {
  getDisplayType,
  handleAdvancedSettingChange,
  getControlsSorts,
  updateConfig,
  getAdvanceSetting,
} from '../../util/setting';
import Sort from 'src/pages/widgetConfig/widgetSetting/components/sublist/Sort';
import { getSortData } from 'src/pages/worksheet/util';
import { EditInfo, SettingItem, RelateDetail } from '../../styled';
import { useSheetInfo } from '../../hooks';
import components from '../components';
import { formatViewToDropdown, getFilterRelateControls, toEditWidgetPage, formatControlsToDropdown } from '../../util';
import sheetComponents from '../components/relateSheet';
import { SYSTEM_CONTROL } from '../../config/widget';
import { FilterItemTexts, FilterDialog } from '../components/FilterData';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import { WHOLE_SIZE } from '../../config/Drag';
import WidgetVerify from '../components/WidgetVerify';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { v4 as uuidv4 } from 'uuid';
import WidgetRowHeight from '../components/WidgetRowHeight';

const { ConfigRelate, BothWayRelate, SearchConfig } = sheetComponents;
const { SheetDealDataType, RelateSheetInfo } = components;

const TEXT_TYPE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

const FILL_TYPES = [
  {
    text: _l('填满'),
    value: '0',
  },
  {
    text: _l('完整显示'),
    value: '1',
  },
];

const RelateSheetWrap = styled.div`
  .filterBtn {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const RelateSheetCover = styled.div`
  display: flex;
  .sortColumnWrap {
    flex: 1;
    .Dropdown--input {
      border-right: none;
      border-radius: 3px 0px 0px 3px;
    }
  }
  .relateCoverSetting {
    width: 36px;
    height: 36px;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid #ccc;
    text-align: center;
    &:hover {
      background: #f5f5f5;
    }
    .coverIcon {
      color: #9e9e9e;
      line-height: 34px;
      &.active {
        color: #2196f3;
      }
    }
  }
`;

const CoverWrap = styled.div`
  width: 308px;
  max-height: 350px;
  overflow-x: hidden;
  background: #ffffff;
  box-shadow: 0px 4px 12px 1px rgba(0, 0, 0, 0.1608);
  padding: 16px;
  .coverTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .coverType {
    display: Inline-block;
    border-radius: 3px 0px 0px 3px;
    border: 1px solid #ddd;
    padding: 6px 18px;
    color: #757575;
    &.active {
      color: #2196f3;
      border-color: #2196f3;
    }
    &:last-child {
      border-radius: 0px 3px 3px 0px;
    }
  }
`;

const SheetViewWrap = styled.div`
  display: flex;
  border-radius: 3px;
  border: 1px solid #dddddd;
  margin-top: 8px;
  .Dropdown--input {
    border: none !important;
  }
  .ming.Dropdown.disabled {
    background-color: #fff !important;
  }
  .viewCon {
    padding: 0 16px;
    background: #fafafa;
    line-height: 34px;
    text-align: center;
    color: #757575;
  }
  .filterEditIcon {
    width: 36px;
    text-align: center;
    cursor: pointer;
    border-left: 1px solid #dddddd;
    color: #989898;
    &:hover {
      background: #f5f5f5;
      color: #2196f3;
    }
  }
`;

export default function RelateSheet(props) {
  let {
    from,
    data,
    deleteWidget,
    onChange,
    globalSheetInfo,
    saveControls,
    allControls,
    globalSheetControls,
    status: { saveIndex = 0 } = {},
  } = props;
  const { worksheetId: sourceId, appId: defaultAppId, name: defaultWorksheetName } = globalSheetInfo;
  const {
    controlId,
    enumDefault = 1,
    enumDefault2 = 1,
    showControls,
    sourceEntityName,
    relationControls = [],
    dataSource,
    viewId,
    coverCid,
    sourceControl,
  } = data;
  let {
    showtype = String(enumDefault),
    allowlink,
    allowcancel = '1',
    controlssorts = '[]',
    ddset,
    searchcontrol = '',
    dismanual = 0,
    covertype = '0',
    showcount = '0',
    scanlink = '1',
    scancontrol = '1',
    scancontrolid,
    openview = '',
    searchrange = '1',
  } = getAdvanceSetting(data);
  const filters = getAdvanceSetting(data, 'filters');
  const searchfilters = getAdvanceSetting(data, 'searchfilters');
  const resultfilters = getAdvanceSetting(data, 'resultfilters');
  const strDefault = data.strDefault || '000';
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];

  const [isHiddenOtherViewRecord, disableAlbum, onlyRelateByScanCode] = strDefault.split('');

  const [{ isRelateView, searchVisible, filterVisible, resultFilterVisible, sortVisible, resultVisible }, setState] =
    useSetState({
      isRelateView: Boolean(viewId),
      filterVisible: false,
      searchVisible: false,
      resultFilterVisible: false,
      sortVisible: false,
      resultVisible: (resultfilters && resultfilters.length > 0) || !!+isHiddenOtherViewRecord,
    });

  const {
    loading,
    data: { info: worksheetInfo = {}, views = [], controls = [] },
  } = useSheetInfo({ worksheetId: dataSource, saveIndex });

  useEffect(() => {
    //  切换控件手动更新
    if (!loading && !isEmpty(controls) && worksheetInfo.worksheetId === dataSource) {
      onChange({
        relationControls: controls,
        sourceEntityName: worksheetInfo.name,
        showControls: getShowControls(controls),
      });
    }
    if (!getAdvanceSetting(data, 'showtype')) {
      onChange(handleAdvancedSettingChange(data, { showtype: '1' }));
    }
  }, [dataSource, loading, data.controlId, enumDefault]);

  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);

  const isListDisplay = String(showtype) === '2';
  const filterControls = getFilterRelateControls(relationControls);
  const titleControl = _.find(filterControls, item => item.attribute === 1);
  const disableOpenViewDrop = !openview && viewId && !selectedViewIsDeleted;
  const scanControls = formatControlsToDropdown(relationControls.filter(item => TEXT_TYPE_CONTROL.includes(item.type)));
  const isScanControlDelete = scancontrolid && _.find(scanControls, s => s.value === scancontrolid) === -1;

  useEffect(() => {
    setState({ isRelateView: Boolean(viewId) });
    if (_.isUndefined(allowlink)) {
      onChange(handleAdvancedSettingChange(data, { allowlink: '1' }));
    }
  }, [controlId]);

  useEffect(() => {
    if (scanlink !== '1' && scancontrol !== '1') {
      onChange({
        strDefault: updateConfig({
          config: strDefault,
          value: '0',
          index: 2,
        }),
      });
    }
  }, [scancontrol, scanlink]);
  const isSheetDisplay = () => {
    return showtype === '2';
  };

  const getShowControls = controls => {
    if (ddset !== '1' && showtype === '3') return [];
    const feControls = getFilterRelateControls(controls);
    if (isEmpty(showControls) && controlId.indexOf('-') > -1) return feControls.slice(0, 4).map(item => item.controlId);
    // 删除掉showControls 中已经被删掉的控件
    const allControlId = controls.map(item => item.controlId);
    return showControls.filter(i => allControlId.includes(i));
  };

  const getGhostControlId = () => {
    if (isSheetDisplay() || !titleControl) return [];
    return [titleControl.controlId];
  };

  const renderCover = () => {
    return (
      <CoverWrap>
        <div className="coverTitle">
          <span className="Bold">{_l('封面')}</span>
          {coverCid && (
            <span
              className="Gray_9e Hover_21 Hand"
              onClick={() => onChange({ ...handleAdvancedSettingChange(data, { covertype: '0' }), coverCid: '' })}
            >
              {_l('清除')}
            </span>
          )}
        </div>
        <div className="Gray_9e mTop10">{_l('选择作为封面图片的附件字段')}</div>
        <RadioGroup
          radioItemClassName="mTop10"
          disabled={!dataSource}
          checkedValue={coverCid}
          data={filterControls
            .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
            .map(c => ({
              text: c.controlName,
              value: c.controlId,
            }))}
          vertical={true}
          onChange={value => onChange({ coverCid: value })}
        />
        <div className="flexCenter mTop20">
          <span className="Gray_75 mRight20">{_l('填充方式')}</span>
          {FILL_TYPES.map(item => {
            return (
              <span
                className={cx('coverType Hand', { active: item.value === covertype })}
                onClick={() => onChange(handleAdvancedSettingChange(data, { covertype: item.value }))}
              >
                {item.text}
              </span>
            );
          })}
        </div>
      </CoverWrap>
    );
  };

  const renderFilters = ({ filterKey, isVisible, visibleKey, title }) => {
    const filterData = getAdvanceSetting(data, [filterKey]);
    return (
      <Fragment>
        {isVisible && (
          <FilterDialog
            {...props}
            title={title}
            filters={filterData}
            supportGroup
            relationControls={controls}
            globalSheetControls={globalSheetControls}
            fromCondition={filterKey !== 'resultfilters' ? 'relateSheet' : ''}
            allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
            onChange={({ filters }) => {
              onChange(handleAdvancedSettingChange(data, { [filterKey]: JSON.stringify(filters) }));
              setState({ [visibleKey]: false });

              if (filterKey === 'resultfilters') {
                setState({
                  resultVisible: (filters && filters.length > 0) || !!+isHiddenOtherViewRecord,
                });
              }
            }}
            onClose={() => setState({ [visibleKey]: false })}
          />
        )}
        {!isEmpty(filterData) && (
          <FilterItemTexts
            {...props}
            filters={filterData}
            globalSheetControls={globalSheetControls}
            loading={loading}
            controls={controls}
            allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
            editFn={() => setState({ [visibleKey]: true })}
          />
        )}
      </Fragment>
    );
  };

  return (
    <RelateSheetWrap>
      {dataSource ? (
        <RelateDetail>
          <div className="text">{defaultWorksheetName}</div>
          <i
            className={cx(
              'Font16 Gray_9e mRight6',
              !_.get(sourceControl, 'controlId') ? 'icon-trending' : 'icon-sync1',
            )}
          />
          <div
            className="name flexCenter overflow_ellipsis"
            onClick={() => {
              const toPage = () =>
                toEditWidgetPage({
                  sourceId: dataSource,
                  ...(!_.get(sourceControl, 'controlId') ? {} : { targetControl: sourceControl.controlId }),
                  fromURL: 'newPage',
                });
              props.relateToNewPage(toPage);
            }}
          >
            <span className="overflow_ellipsis pointer ThemeColor3 Bold" title={sourceEntityName}>
              {sourceEntityName}
            </span>
            {!loading && defaultAppId !== worksheetInfo.appId && (
              <span className="mLeft6">({worksheetInfo.appName})</span>
            )}
          </div>
        </RelateDetail>
      ) : (
        <ConfigRelate
          {...props}
          value={dataSource}
          onOk={({ sheetId, control, sheetName }) => {
            let para = { dataSource: sheetId, size: WHOLE_SIZE };
            // 关联本表
            if (sheetId === sourceId) {
              onChange({ ...para, controlName: _l('父'), enumDefault2: 0 }, widgets => {
                saveControls({ refresh: true, actualWidgets: widgets });
              });
            } else {
              onChange(sheetName ? { ...para, controlName: sheetName } : para);
            }
            // 使用关联控件
            if (!_.isEmpty(control)) {
              const nextData = update(control, { advancedSetting: { hide: { $set: '' } } });
              onChange(nextData);
            }
          }}
          deleteWidget={() => deleteWidget(controlId)}
        />
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录数量')}</div>
        <RadioGroup
          data={[
            { text: _l('单条'), value: 1 },
            { text: _l('多条'), value: 2 },
          ]}
          checkedValue={enumDefault}
          onChange={value => {
            if (value === 1) {
              let nextData = { ...data, enumDefault: 1 };
              // 从关联多条列表切换到关联单条自动切换为单条卡片
              if (showtype === '2') {
                nextData = handleAdvancedSettingChange(nextData, { showtype: '1' });
              }
              // 关联单条不支持一下操作
              nextData = handleAdvancedSettingChange(nextData, { sorts: '', allowcancel: '0' });
              onChange(nextData);
              return;
            }
            onChange({ enumDefault: value, size: WHOLE_SIZE });
          }}
          size="small"
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Dropdown
          border
          value={showtype}
          data={getDisplayType({ from, type: enumDefault })}
          onChange={value => {
            let nextData = handleAdvancedSettingChange(data, { showtype: value });
            // 非卡片 铺满整行
            if (value !== '3') {
              nextData = { ...nextData, showControls: getShowControls(nextData.relationControls) };
            } else {
              // 下拉框清空
              nextData = { ...handleAdvancedSettingChange(nextData, { searchfilters: '' }), showControls: [] };
            }
            // 切换为列表 必填置为false, 默认值清空
            if (value === '2') {
              nextData = {
                ...nextData,
                required: false,
                advancedSetting: Object.assign(nextData.advancedSetting, { defsource: '', hidetitle: '0' }),
              };
            } else {
              nextData = handleAdvancedSettingChange(nextData, { sorts: '' });
            }
            onChange(nextData);
          }}
        />
        {showtype === '3' && (
          <div className="labelWrap">
            <Checkbox
              className="displayCover"
              size="small"
              style={{ marginTop: '12px' }}
              text={_l('在下拉列表中显示附加字段和封面')}
              checked={ddset === '1'}
              onClick={checked => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    ddset: String(+!checked),
                  }),
                );
              }}
            >
              <Tooltip
                className="hoverTip"
                title={_l('在选择关联的记录时显示附加的字段值和封面，帮助您快速找到需要关联的记录')}
              >
                <i className="icon pointer icon-help Gray_bd Font15" />
              </Tooltip>
            </Checkbox>
          </div>
        )}
      </SettingItem>
      {ddset !== '1' && showtype === '3' ? null : (
        <SettingItem>
          <div className="settingItemTitle mBottom8">
            <span style={{ fontWeight: 'normal' }}>{_l('显示字段')}</span>
            {enumDefault === 1 && (
              <Tooltip
                className="hoverTip"
                title={
                  <span>
                    {_l('在卡片中，最多可显示9个所选字段。在选择已有记录进行关联时，可以查看所有选择的字段。')}
                  </span>
                }
                popupPlacement="bottom"
              >
                <i className="icon icon-help pointer Gray_bd Font15" />
              </Tooltip>
            )}
          </div>
          <RelateSheetCover>
            <SortColumns
              empty={<div />}
              min1msg={_l('至少显示一列')}
              noempty={false}
              ghostControlIds={getGhostControlId()}
              showControls={showControls}
              columns={filterControls}
              controlsSorts={getControlsSorts(data, filterControls)}
              onChange={({ newShowControls, newControlSorts }) => {
                onChange(
                  _.assign(
                    {},
                    handleAdvancedSettingChange(data, {
                      controlssorts: JSON.stringify(newControlSorts),
                    }),
                    {
                      showControls: newShowControls,
                    },
                  ),
                );
              }}
            />
            <Trigger
              popup={renderCover}
              action={['click']}
              popupAlign={{
                points: ['tr', 'br'],
                offset: [0, 2],
                overflow: { adjustX: true, adjustY: true },
              }}
              getPopupContainer={() => document.body}
            >
              <div className="relateCoverSetting tip-bottom" data-tip={_l('设置封面')}>
                <span className={cx('icon-picture coverIcon Font22 Hand', { active: !!coverCid })}></span>
              </div>
            </Trigger>
          </RelateSheetCover>
        </SettingItem>
      )}
      {isListDisplay && <WidgetRowHeight {...props} />}
      {showtype === '2' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排序')}</div>
          <EditInfo className="pointer subListSortInput" onClick={() => setState({ sortVisible: true })}>
            <div className="overflow_ellipsis Gray">
              {sorts.length > 0 ? (
                sorts.reduce((p, item) => {
                  const sortsRelationControls = relationControls
                    .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                    .concat(SYSTEM_CONTROLS);
                  const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
                  const flag = item.isAsc === true ? 2 : 1;
                  const { text } = getSortData(control.type, control).find(item => item.value === flag);
                  const value = control.controlId ? _l('%0: %1', control.controlName, text) : '';
                  return p ? `${p}；${value}` : value;
                }, '')
              ) : (
                <span className="Gray_75">{isRelateView ? _l('按关联视图配置') : _l('未设置（按添加顺序）')}</span>
              )}
            </div>
            {sorts.length > 0 && (
              <div className="flexCenter">
                <div
                  className="clearBtn mRight10"
                  onClick={e => {
                    e.stopPropagation();
                    onChange(handleAdvancedSettingChange(data, { sorts: '' }));
                  }}
                >
                  <i className="icon-closeelement-bg-circle"></i>
                </div>
                <div className="edit">
                  <i className="icon-edit"></i>
                </div>
              </div>
            )}
          </EditInfo>
          {sortVisible && (
            <Sort
              {...props}
              fromRelate={true}
              controls={relationControls}
              onClose={() => setState({ sortVisible: false })}
            />
          )}
        </SettingItem>
      )}
      <DynamicDefaultValue {...props} titleControl={titleControl} />
      {showtype !== '2' && <WidgetVerify {...props} />}
      <SettingItem>
        <div className="settingItemTitle">{_l('操作')}</div>
        <div className="labelWrap">
          <Checkbox
            className="allowSelectRecords InlineBlock Gray"
            size="small"
            disabled={_.includes([0, 1], enumDefault2) && showtype === '3'} // 下拉框不能取消勾选
            text={_l('允许选择已有记录')}
            checked={_.includes([0, 1], enumDefault2)}
            onClick={checked => {
              // enumDefault2使用两位数代表两个字段的布尔值 所以此处有恶心判断
              if (checked) {
                onChange({
                  ...handleAdvancedSettingChange(data, { searchrange: '', filters: '' }),
                  enumDefault2: enumDefault2 === 0 ? 10 : 11,
                });
              } else {
                onChange({
                  ...handleAdvancedSettingChange(data, { searchrange: '1' }),
                  enumDefault2: enumDefault2 === 10 ? 0 : 1,
                });
              }
            }}
          />
        </div>
        {_.includes([0, 1], enumDefault2) && (
          <Fragment>
            <SheetViewWrap>
              <div className="viewCon">{_l('权限')}</div>
              <Dropdown
                border
                className="flex"
                data={[
                  { text: _l('所有记录'), value: '1' },
                  { text: _l('有查看权限的记录'), value: '0' },
                ]}
                value={searchrange}
                onChange={value => {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      searchrange: value,
                    }),
                  );
                }}
              />
              <div
                className="filterEditIcon tip-bottom"
                data-tip={_l('过滤选择范围')}
                onClick={() => {
                  if (!filters || !filters.length || filters.length <= 0) {
                    if (!dataSource) {
                      alert(_l('请先选择工作表'), 3);
                      return;
                    }
                    setState({
                      filterVisible: true,
                    });
                  } else {
                    onChange(
                      handleAdvancedSettingChange(data, {
                        filters: '',
                      }),
                    );
                  }
                }}
              >
                <i
                  className={cx('icon-filter Font22 LineHeight34', {
                    ThemeColor3: filters && filters.length,
                  })}
                ></i>
              </div>
            </SheetViewWrap>
            {renderFilters({ filterKey: 'filters', isVisible: filterVisible, visibleKey: 'filterVisible' })}
          </Fragment>
        )}

        <div className="labelWrap">
          <Checkbox
            className="allowSelectRecords "
            size="small"
            text={_l('允许新增记录')}
            checked={_.includes([0, 10], enumDefault2)}
            onClick={checked => {
              // enumDefault2使用两位数代表两个字段的布尔值 所以此处有恶心判断
              if (checked) {
                onChange({
                  enumDefault2: enumDefault2 === 0 ? 1 : 11,
                });
              } else {
                onChange({
                  enumDefault2: enumDefault2 === 1 ? 0 : 10,
                });
              }
            }}
          />
        </div>
        {enumDefault === 2 && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={_l('允许取消关联')}
              checked={allowcancel !== '0'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowcancel: checked ? '0' : '1' }))}
            />
          </div>
        )}
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许打开记录')}
            checked={+allowlink}
            onClick={checked =>
              onChange(handleAdvancedSettingChange(data, { allowlink: +!checked, openview: checked ? '' : openview }))
            }
          />
        </div>
        {+allowlink ? (
          <SheetViewWrap>
            <div className="viewCon">{_l('视图')}</div>
            <Dropdown
              border
              className="flex"
              cancelAble
              loading={loading}
              placeholder={
                selectedOpenViewIsDelete || selectedViewIsDeleted ? (
                  <span className="Red">{_l('已删除')}</span>
                ) : viewId && !selectedViewIsDeleted ? (
                  _l('按关联视图配置')
                ) : (
                  _l('未设置')
                )
              }
              data={formatViewToDropdown(views)}
              value={openview && !selectedOpenViewIsDelete ? openview : undefined}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { openview: value }));
              }}
            />
          </SheetViewWrap>
        ) : null}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('设置')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={!!searchcontrol}
            onClick={() => {
              if (searchcontrol) {
                onChange(
                  handleAdvancedSettingChange(data, {
                    searchcontrol: '',
                    searchtype: '',
                    clicksearch: '',
                    searchfilters: '',
                  }),
                );
              }
              setState({ searchVisible: !searchcontrol });
            }}
          >
            <span style={{ marginRight: '6px' }}>{_l('查询设置')}</span>
            <Tooltip
              className="hoverTip"
              title={<span>{_l('设置用户选择关联记录时可以搜索和筛选的字段')}</span>}
              popupPlacement="bottom"
            >
              <i className="icon pointer icon-help Gray_bd Font15" />
            </Tooltip>
          </Checkbox>
        </div>
        {searchcontrol && (
          <EditInfo style={{ margin: '12px 0' }} onClick={() => setState({ searchVisible: true })}>
            <div className="text overflow_ellipsis Gray">
              <span className="Bold">{_l('搜索 ')}</span>
              {get(
                controls.find(item => item.controlId === searchcontrol),
                'controlName',
              ) || _l('字段已删除')}
              {searchfilters.length > 0 && (
                <Fragment>
                  <span className="Bold">{_l('；筛选 ')}</span>
                  {_l('%0个字段', searchfilters.length)}
                </Fragment>
              )}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
        )}
        {searchVisible && (
          <SearchConfig {...props} controls={controls} onClose={() => setState({ searchVisible: false })} />
        )}
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={isRelateView}
            onClick={checked => {
              setState({ isRelateView: !checked });
              if (checked) {
                onChange({ viewId: '' });
              }
            }}
          >
            <span style={{ marginRight: '6px' }}>{_l('关联视图')}</span>
            <Tooltip
              popupPlacement="bottom"
              title={
                <span>
                  {_l(
                    '设置关联视图，统一控制关联记录的排序方式、选择范围、和打开记录时的视图。字段本身设置的排序和打开记录视图优先级高于此配置；过滤选择范围的效果为叠加。',
                  )}
                </span>
              }
            >
              <i className="icon-help Gray_bd Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
        {isRelateView && (
          <Dropdown
            border
            style={{ marginTop: '10px' }}
            loading={loading}
            noneContent={_l('请先选择关联表')}
            placeholder={
              selectedViewIsDeleted ? <span className="Red">{_l('视图已删除，请重新选择')}</span> : _l('选择视图')
            }
            data={dataSource ? formatViewToDropdown(views) : []}
            value={viewId && !selectedViewIsDeleted ? viewId : undefined}
            onChange={value => {
              onChange({ viewId: value });
            }}
          />
        )}
        {showtype === '2' && (
          <Fragment>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={resultVisible}
                onClick={checked => {
                  if (checked) {
                    onChange({
                      ...handleAdvancedSettingChange(data, { resultfilters: '' }),
                      strDefault: updateConfig({
                        config: strDefault,
                        value: +!checked,
                        index: 0,
                      }),
                    });
                    setState({ resultVisible: false });
                  } else {
                    setState({ resultVisible: true });
                  }
                }}
              >
                <span style={{ marginRight: '6px' }}>{_l('过滤显示结果')}</span>
              </Checkbox>
            </div>
            {resultVisible && (
              <div className="mLeft25">
                <div className="labelWrap">
                  <Checkbox
                    size="small"
                    checked={resultfilters && resultfilters.length > 0}
                    onClick={checked => {
                      if (checked) {
                        onChange(handleAdvancedSettingChange(data, { resultfilters: '' }));
                        setState({ resultVisible: !!+isHiddenOtherViewRecord });
                      } else {
                        setState({ resultFilterVisible: true });
                      }
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>{_l('按条件过滤')}</span>
                    <Tooltip
                      popupPlacement="bottom"
                      title={<span>{_l('设置筛选条件，只显示满足条件的关联记录')}</span>}
                    >
                      <i className="icon-help Gray_bd Font16 pointer"></i>
                    </Tooltip>
                  </Checkbox>
                </div>
                {renderFilters({
                  filterKey: 'resultfilters',
                  isVisible: resultFilterVisible,
                  visibleKey: 'resultFilterVisible',
                  title: _l('设置筛选条件'),
                })}
                <div className="labelWrap">
                  <Checkbox
                    className="allowSelectRecords"
                    size="small"
                    checked={!!+isHiddenOtherViewRecord}
                    onClick={checked => {
                      onChange({
                        strDefault: updateConfig({
                          config: strDefault,
                          value: +!checked,
                          index: 0,
                        }),
                      });
                      setState({ resultVisible: (resultfilters && resultfilters.length > 0) || !!+!checked });
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>{_l('按用户权限过滤')}</span>
                    <Tooltip
                      popupPlacement="bottom"
                      title={
                        <span>
                          {_l(
                            '未勾选时，用户在关联列表中可以查看所有关联数据。勾选后，按照用户对关联的工作表/视图的权限查看，隐藏无权限的数据或字段',
                          )}
                        </span>
                      }
                    >
                      <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
                    </Tooltip>
                  </Checkbox>
                </div>
              </div>
            )}
            <div className="labelWrap">
              <Checkbox
                className="allowSelectRecords"
                size="small"
                text={_l('显示计数')}
                checked={showcount !== '1'}
                onClick={checked =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      showcount: checked ? '1' : '0',
                    }),
                  )
                }
              >
                <Tooltip
                  popupPlacement="bottom"
                  title={
                    <span>
                      {_l(
                        '在表单中显示关联记录的数量。当设置了[过滤关联结果]、[按用户权限查看]后可见数量会少于计数，建议关闭此配置。',
                      )}
                    </span>
                  }
                >
                  <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
                </Tooltip>
              </Checkbox>
            </div>
          </Fragment>
        )}
      </SettingItem>
      {dataSource !== sourceId && from !== 'subList' && (
        <BothWayRelate
          worksheetInfo={worksheetInfo}
          onOk={obj => {
            onChange(update(data, { sourceControl: { $set: { ...obj, type: 29 } } }));
          }}
          {...props}
        />
      )}
      <SettingItem className="withSplitLine">
        <div className="settingItemTitle">
          {_l('移动端输入')}
          <Tooltip
            placement={'bottom'}
            title={_l('通过启用设备摄像头实现扫码输入。仅移动app中扫码支持区分条形码、二维码，其他平台扫码不做区分。')}
          >
            <i className="icon-help Gray_9e Font16 pointer"></i>
          </Tooltip>
        </div>
        <Checkbox
          size="small"
          checked={!!+onlyRelateByScanCode}
          onClick={checked =>
            onChange({
              ...handleAdvancedSettingChange(data, { scancontrolid: checked ? '' : scancontrolid }),
              strDefault: updateConfig({
                config: strDefault,
                value: +!checked,
                index: 2,
              }),
            })
          }
          text={_l('扫码添加关联  ')}
        />
      </SettingItem>
      {!!+onlyRelateByScanCode && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('扫码内容')}
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={scanlink === '1'}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { scanlink: String(+!checked) }))}
                text={_l('记录链接')}
              />
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={scancontrol === '1'}
                onClick={checked =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      scancontrol: String(+!checked),
                      scancontrolid: checked ? '' : scancontrolid,
                    }),
                  )
                }
                text={_l('字段值')}
              />
            </div>
            {scancontrol === '1' && (
              <Dropdown
                border
                className="mTop8"
                cancelAble
                placeholder={isScanControlDelete ? <span className="Red">{_l('已删除')}</span> : _l('所有文本类型字段')}
                data={scanControls}
                value={isScanControlDelete ? undefined : scancontrolid || undefined}
                onChange={value => {
                  onChange(handleAdvancedSettingChange(data, { scancontrolid: value || '' }));
                }}
              />
            )}
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle" style={{ fontWeight: 'normal' }}>
              {_l('选项')}
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={dismanual === '1'}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { dismanual: String(+!checked) }))}
                text={_l('禁止手动输入')}
              />
              <Tooltip placement={'bottom'} title={_l('勾选后禁止PC端和移动端手动添加关联记录')}>
                <i className="icon-help Gray_9e Font16 pointer mLeft8"></i>
              </Tooltip>
            </div>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={!!+disableAlbum}
                onClick={checked =>
                  onChange({
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +!checked,
                      index: 1,
                    }),
                  })
                }
                text={_l('禁用相册')}
              />
            </div>
            <SheetDealDataType {...props} />
          </SettingItem>
        </Fragment>
      )}
    </RelateSheetWrap>
  );
}
