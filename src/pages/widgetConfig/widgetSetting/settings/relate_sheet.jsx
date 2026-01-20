import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Dropdown, RadioGroup, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import Sort from 'src/pages/widgetConfig/widgetSetting/components/sublist/Sort';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { getSortData } from 'src/utils/control';
import { SUPPORT_RELATE_SEARCH } from '../../config';
import { WHOLE_SIZE } from '../../config/Drag';
import { RELATE_SORT_DISPLAY } from '../../config/setting';
import { useSheetInfo } from '../../hooks';
import { AnimationWrap, EditInfo, SettingItem } from '../../styled';
import { filterSysControls, formatControlsToDropdown, getFilterRelateControls, isCustomWidget } from '../../util';
import {
  getAdvanceSetting,
  getControlsSorts,
  getDisplayType,
  handleAdvancedSettingChange,
  updateConfig,
} from '../../util/setting';
import { getPathById, isFullLineControl } from '../../util/widgets';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import RelateDetailInfo from '../components/RelateDetailInfo';
import ConfigRelate from '../components/relateSheet/ConfigRelate';
import WidgetVerify from '../components/WidgetVerify';

const FILL_TYPES = [
  { text: _l('填满'), value: '0' },
  { text: _l('完整显示'), value: '1' },
];

const DISPLAY_COUNT = [
  { text: _l('单条'), value: 1 },
  { text: _l('多条'), value: 2 },
];

const DISPLAY_CHOOSE = [
  { text: _l('下拉框'), value: '3' },
  { text: _l('弹层'), value: '1' },
];

const RelateSheetWrap = styled.div`
  .filterBtn {
    color: #9e9e9e;
    &:hover {
      color: #1677ff;
    }
  }
  .emptyRelateView {
    width: 100%;
    height: 36px;
    background: #f5f5f5;
    border-radius: 3px;
    line-height: 36px;
    padding: 0 12px;
    margin-top: 12px;
    color: #9e9e9e;
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
        color: #1677ff;
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
      color: #1677ff;
      border-color: #1677ff;
    }
    &:last-child {
      border-radius: 0px 3px 3px 0px;
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
    status: { saveIndex = 0 } = {},
    fromPortal,
    widgets = [],
  } = props;
  const { worksheetId: sourceId } = globalSheetInfo;
  const {
    controlId,
    enumDefault = 1,
    showControls,
    relationControls = [],
    dataSource,
    viewId,
    coverCid,
    advancedSetting = {},
  } = data;
  let {
    showtype = '3',
    allowlink,
    ddset,
    covertype = '0',
    scanlink = '1',
    scancontrol = '1',
    showtitleid,
    choosecoverid,
    choosecovertype = '0',
    allowdrag = '0',
  } = getAdvanceSetting(data);
  const strDefault = data.strDefault || '000';
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];
  const chooseshowIds = getAdvanceSetting(data, 'chooseshowids') || [];

  const [{ sortVisible }, setState] = useSetState({
    sortVisible: false,
  });

  const isRelateView = Boolean(viewId);

  const rcsorttype = advancedSetting.rcsorttype || (sorts.length > 0 ? '2' : isRelateView ? '3' : '1');

  const {
    loading,
    data: { info: worksheetInfo = {}, views = [], controls = [] },
  } = useSheetInfo({ worksheetId: dataSource, getSwitchPermit: true, saveIndex });

  useEffect(() => {
    //  切换控件手动更新
    if (!loading && !isEmpty(controls) && worksheetInfo.worksheetId === dataSource) {
      // 缓存一份接口数据使用
      window.subListSheetConfig[controlId] = {
        loading,
        sheetInfo: worksheetInfo,
        views,
        controls,
      };
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

  const filterControls = getFilterRelateControls({ controls: relationControls, showControls, data });
  const titleControl = _.find(filterControls, item => item.attribute === 1);
  const RELATION_SHEET_DISPLAY = getDisplayType({ from, type: enumDefault });
  const setTitleControls = filterSysControls(filterControls).filter(i => _.includes(SUPPORT_RELATE_SEARCH, i.type));
  const showTitleDelete = showtitleid && !_.find(setTitleControls, s => s.controlId === showtitleid);

  useEffect(() => {
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
  const isSheetDisplay = value => {
    return _.includes(['2', '5', '6'], value || showtype);
  };

  const getShowControls = (controls, showType) => {
    if (ddset !== '1' && showtype === '3') return [];
    const feControls = getFilterRelateControls({ controls, data });
    if (isEmpty(showControls) && controlId.indexOf('-') > -1) return feControls.slice(0, 4).map(item => item.controlId);
    // 删除掉showControls 中已经被删掉的控件
    return showControls.filter(i => {
      const curItem = _.find(controls, c => c.controlId === i);
      if (!curItem) return false;
      if (curItem.type === 47) return isSheetDisplay(showType);
      return true;
    });
  };

  // 附加信息 + 显示字段
  const renderExtraInfo = () => {
    return (
      <Fragment>
        <div className="labelWrap mTop20">
          <Checkbox
            className="displayCover"
            size="small"
            text={_l('在下拉列表中显示附加信息和封面')}
            checked={ddset === '1'}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  ['ddset']: String(+!checked),
                }),
              );
            }}
          >
            <Tooltip
              className="hoverTip"
              title={_l('在选择关联的记录时显示附加的字段值和封面，帮助您快速找到需要关联的记录')}
            >
              <i className="icon pointer icon-help Gray_9e Font16" />
            </Tooltip>
          </Checkbox>
        </div>
        {ddset === '1' && renderShowControl(false, true)}
      </Fragment>
    );
  };

  // 显示字段
  const renderShowControl = (isExtra, hideTitle) => {
    const coverId = isExtra ? choosecoverid : coverCid;
    const renderCover = () => {
      const coverType = isExtra ? choosecovertype : covertype;
      const typeKey = isExtra ? 'choosecovertype' : 'covertype';
      return (
        <CoverWrap>
          <div className="coverTitle">
            <span className="Bold">{_l('封面')}</span>
            {coverId && (
              <span
                className="Gray_9e Hover_21 Hand"
                onClick={() => {
                  if (isExtra) {
                    onChange(handleAdvancedSettingChange(data, { choosecoverid: '', choosecovertype: '0' }));
                    return;
                  }
                  onChange({ ...handleAdvancedSettingChange(data, { covertype: '0' }), coverCid: '' });
                }}
              >
                {_l('清除')}
              </span>
            )}
          </div>
          <div className="Gray_9e mTop10">{_l('选择作为封面图片的附件字段')}</div>
          <RadioGroup
            radioItemClassName="mTop10"
            disabled={!dataSource}
            checkedValue={coverId}
            data={filterControls
              .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
              .map(c => ({
                text: c.controlName,
                value: c.controlId,
              }))}
            vertical={true}
            onChange={value => {
              if (isExtra) {
                onChange(handleAdvancedSettingChange(data, { choosecoverid: value }));
                return;
              }
              onChange({ coverCid: value });
            }}
          />
          <div className="flexCenter mTop20">
            <span className="Gray_75 mRight20">{_l('填充方式')}</span>
            {FILL_TYPES.map(item => {
              return (
                <span
                  className={cx('coverType Hand', { active: item.value === coverType })}
                  onClick={() => onChange(handleAdvancedSettingChange(data, { [typeKey]: item.value }))}
                >
                  {item.text}
                </span>
              );
            })}
          </div>
        </CoverWrap>
      );
    };

    return (
      <SettingItem hide={isCustomWidget(data)}>
        {!hideTitle && (
          <div className="settingItemTitle mBottom8">
            <span>{_l('显示字段')}</span>
          </div>
        )}
        <RelateSheetCover>
          <SortColumns
            sortAutoChange
            isShowColumns
            empty={<div />}
            forbiddenScroll={true}
            min1msg={_l('至少显示一列')}
            noempty={false}
            ghostControlIds={[]}
            showControls={isExtra ? chooseshowIds : showControls}
            columns={filterControls}
            controlsSorts={getControlsSorts(data, filterControls, isExtra ? 'choosecontrolssorts' : undefined)}
            onChange={({ newShowControls, newControlSorts }) => {
              if (isExtra) {
                onChange(
                  handleAdvancedSettingChange(data, {
                    chooseshowids: JSON.stringify(newShowControls),
                    choosecontrolssorts: JSON.stringify(newControlSorts),
                  }),
                );
                return;
              }
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
            <Tooltip title={_l('设置封面')} placement="bottom">
              <div className="relateCoverSetting">
                <span className={cx('icon-picture coverIcon Font22 Hand', { active: !!coverId })}></span>
              </div>
            </Tooltip>
          </Trigger>
        </RelateSheetCover>
      </SettingItem>
    );
  };

  return (
    <RelateSheetWrap>
      {dataSource ? (
        <RelateDetailInfo {...props} sheetInfo={worksheetInfo} />
      ) : (
        <ConfigRelate
          {...props}
          value={dataSource}
          onOk={({ sheetId, control, sheetName }) => {
            const path = getPathById(widgets, controlId);
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
              const nextData = update(control, {
                advancedSetting: { hide: { $set: '' } },
                row: { $set: path[0] },
                col: { $set: path[1] },
                size: { $set: isFullLineControl(control) ? WHOLE_SIZE : data.size },
              });
              onChange(nextData);
            }
          }}
          deleteWidget={() => deleteWidget(controlId)}
        />
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录数量')}</div>
        <AnimationWrap>
          {DISPLAY_COUNT.map(({ text, value }) => (
            <div
              className={cx('animaItem', { active: enumDefault === value })}
              onClick={() => {
                if (value === 1) {
                  let nextData = { ...data, enumDefault: 1 };
                  // 从关联多条列表切换到关联单条自动切换为单条卡片
                  if (isSheetDisplay()) {
                    nextData = handleAdvancedSettingChange(nextData, { showtype: '1', choosetype: '1' });
                  }
                  // 关联单条不支持一下操作
                  nextData = handleAdvancedSettingChange(nextData, { sorts: '', allowcancel: '1', choosesorts: '' });
                  onChange(nextData);
                  return;
                }
                // 多条清掉不允许重复配置
                onChange({
                  ...handleAdvancedSettingChange(data, { choosetype: '2' }),
                  enumDefault: value,
                  unique: false,
                });
              }}
            >
              {text}
            </div>
          ))}
        </AnimationWrap>
      </SettingItem>
      <SettingItem hide={isCustomWidget(data) || (fromPortal && enumDefault === 1)}>
        <div className="settingItemTitle">{enumDefault === 1 ? _l('记录选择方式') : _l('记录显示方式')}</div>
        {enumDefault === 1 ? (
          <AnimationWrap>
            {DISPLAY_CHOOSE.map(({ text, value }) => (
              <div
                className={cx('animaItem', { active: showtype === value })}
                onClick={() => {
                  if (value !== showtype) {
                    const nextData = {
                      ...handleAdvancedSettingChange(data, {
                        sorts: '',
                        resultfilters: '',
                        layercontrolid: '',
                        showtype: value,
                        chooseshowids: value === '3' ? JSON.stringify(showControls) : '',
                        ddset: '0',
                      }),
                      strDefault: updateConfig({
                        config: strDefault,
                        value: 0,
                        index: 0,
                      }),
                      showControls: value === '3' ? [] : chooseshowIds,
                    };
                    onChange(nextData);
                  }
                }}
              >
                {text}
              </div>
            ))}
          </AnimationWrap>
        ) : (
          <Dropdown
            border
            value={showtype}
            data={
              fromPortal
                ? RELATION_SHEET_DISPLAY.filter(i => !i.disabled && i.value === '1')
                : RELATION_SHEET_DISPLAY.filter(i => !i.disabled)
            }
            renderTitle={() =>
              _.get(
                _.find(RELATION_SHEET_DISPLAY, r => r.value === showtype),
                'text',
              )
            }
            onChange={value => {
              let nextData = handleAdvancedSettingChange(data, { showtype: value });
              // 非卡片 铺满整行
              if (value !== '3') {
                nextData = { ...nextData, showControls: getShowControls(nextData.relationControls, value) };
              } else {
                // 下拉框清空
                nextData = {
                  ...handleAdvancedSettingChange(nextData, { searchfilters: '', choosesorts: '' }),
                  showControls: [],
                };
              }
              // 切换为列表 必填置为false,标题样式、动态默认值清空
              if (isSheetDisplay(value)) {
                const newDefsource = safeParse(_.get(nextData, 'advancedSetting.defsource') || '[]');

                nextData = {
                  ...nextData,
                  required: false,
                  size: WHOLE_SIZE,
                  advancedSetting: Object.assign(nextData.advancedSetting, {
                    defsource:
                      newDefsource.length === 0 || (newDefsource.length > 0 && _.get(newDefsource, '0.cid'))
                        ? ''
                        : JSON.stringify(newDefsource),
                    hidetitle: '0',
                    titlesize: '',
                    titlestyle: '',
                    titlecolor: '',
                    ...(value !== '5' ? { layercontrolid: '' } : {}),
                    showtitleid: '',
                  }),
                };
              } else {
                nextData = {
                  ...handleAdvancedSettingChange(nextData, {
                    sorts: '',
                    resultfilters: '',
                    layercontrolid: '',
                    chooseshowids: '',
                    ddset: '0',
                  }),
                  strDefault: updateConfig({
                    config: strDefault,
                    value: 0,
                    index: 0,
                  }),
                };
              }
              onChange(nextData);
            }}
          />
        )}
      </SettingItem>

      {/**下拉框、卡片支持选项名/标题字段 */}
      {!isSheetDisplay() && (
        <SettingItem>
          <div className="settingItemTitle">{_l('标题字段')}</div>
          <Dropdown
            border
            cancelAble
            value={showTitleDelete ? undefined : showtitleid || undefined}
            data={formatControlsToDropdown(setTitleControls)}
            placeholder={showTitleDelete ? <span className="Red">{_l('已删除')}</span> : _l('默认使用记录标题')}
            onChange={value => onChange(handleAdvancedSettingChange(data, { showtitleid: value }))}
          />
        </SettingItem>
      )}

      {enumDefault === 2 && showtype === '3' ? null : renderShowControl(showtype === '3')}

      {/** 附加信息+显示字段 */}
      {showtype === '3' && renderExtraInfo()}

      {enumDefault === 2 && (
        <SettingItem>
          <div className="settingItemTitle" style={{ justifyContent: 'space-between' }}>
            <span>
              {_l('排序')}
              <Tooltip
                placement="bottom"
                title={
                  <span>
                    {_l('当关联记录显示方式为卡片和下拉框时：')}
                    <br />
                    {_l(
                      '1、【按设置的排序】和【按关联视图的排序】两种排序方式仅限在关联数量不超过5条时生效，超出后会继续按添加时的顺序。',
                    )}
                    <br />
                    {_l('2、当排序方式为【按添加时间排序】时，支持拖拽排序，且当关联记录数量小于50条时生效。')}
                    <br />
                    {_l('3、如果有多个关联记录字段都关联相同表时，排序方式也将同时被修改。')}
                    <br />
                    {_l('4、当关联记录显示方式为表格时无以上限制。')}
                  </span>
                }
              >
                <i className="icon-help Gray_9e Font16 Hand mLeft6"></i>
              </Tooltip>
            </span>
            {!isSheetDisplay() && rcsorttype === '1' && (
              <span>
                <span className="Gray_75 mRight10">{_l('允许拖拽排序')}</span>
                <Switch
                  size="small"
                  checked={allowdrag === '1'}
                  onClick={checked => onChange(handleAdvancedSettingChange(data, { allowdrag: String(+!checked) }))}
                />
              </span>
            )}
          </div>
          <Dropdown
            border
            value={rcsorttype}
            data={RELATE_SORT_DISPLAY}
            onChange={value => {
              if (value === rcsorttype) return;
              onChange(handleAdvancedSettingChange(data, { rcsorttype: value, sorts: '', allowdrag: '0' }));
              if (value === '2') {
                setState({ sortVisible: true });
              }
            }}
          />
          {rcsorttype === '2' && (
            <EditInfo className="pointer subListSortInput mTop12" onClick={() => setState({ sortVisible: true })}>
              <div className="overflow_ellipsis Gray">
                {sorts.length > 0 ? (
                  sorts.reduce((p, item) => {
                    const sortsRelationControls = relationControls
                      .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                      .concat(SYSTEM_CONTROLS);
                    const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
                    const flag = item.isAsc === true ? 2 : 1;
                    const { text } = getSortData(control.type, control).find(item => item.value === flag);
                    const value = control.controlId ? `${control.controlName}：${text}` : '';
                    return p ? `${p}；${value}` : value;
                  }, '')
                ) : (
                  <span className="Gray_9e">{_l('未设置排序')}</span>
                )}
              </div>
              {sorts.length > 0 && (
                <div className="flexCenter">
                  <div className="edit">
                    <i className="icon-edit"></i>
                  </div>
                </div>
              )}
            </EditInfo>
          )}
          {rcsorttype === '3' && !isRelateView && <div className="emptyRelateView">{_l('未设置关联视图')}</div>}
          {!isSheetDisplay() && allowdrag === '1' && (
            <div className="Gray_9e mTop8">{_l('拖拽排序仅关联记录数量在50条以内时生效')}</div>
          )}
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
      {!fromPortal && <DynamicDefaultValue {...props} titleControl={titleControl} />}
      {!isSheetDisplay() && <WidgetVerify {...props} />}
    </RelateSheetWrap>
  );
}
