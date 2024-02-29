import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { isEmpty } from 'lodash';
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
import { EditInfo, SettingItem } from '../../styled';
import { useSheetInfo } from '../../hooks';
import { getFilterRelateControls } from '../../util';
import sheetComponents from '../components/relateSheet';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import { WHOLE_SIZE } from '../../config/Drag';
import WidgetVerify from '../components/WidgetVerify';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import RelateDetailInfo from '../components/RelateDetailInfo';

const { ConfigRelate } = sheetComponents;

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

export default function RelateSheet(props) {
  let { from, data, deleteWidget, onChange, globalSheetInfo, saveControls, status: { saveIndex = 0 } = {} } = props;
  const { worksheetId: sourceId } = globalSheetInfo;
  const { controlId, enumDefault = 1, showControls, relationControls = [], dataSource, viewId, coverCid } = data;
  let {
    showtype = String(enumDefault),
    allowlink,
    ddset,
    covertype = '0',
    scanlink = '1',
    scancontrol = '1',
  } = getAdvanceSetting(data);
  const strDefault = data.strDefault || '000';
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];

  const [{ isRelateView, sortVisible }, setState] = useSetState({
    isRelateView: Boolean(viewId),
    sortVisible: false,
  });

  const {
    loading,
    data: { info: worksheetInfo = {}, views = [], controls = [] },
  } = useSheetInfo({ worksheetId: dataSource, saveIndex });

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

  const filterControls = getFilterRelateControls(relationControls, showControls);
  const titleControl = _.find(filterControls, item => item.attribute === 1);

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

  return (
    <RelateSheetWrap>
      {dataSource ? (
        <RelateDetailInfo {...props} sheetInfo={worksheetInfo} />
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
            // 切换为列表 必填置为false,标题样式、动态默认值清空
            if (value === '2') {
              const newDefsource = safeParse(_.get(nextData, 'advancedSetting.defsource') || '[]');

              nextData = {
                ...nextData,
                required: false,
                advancedSetting: Object.assign(nextData.advancedSetting, {
                  defsource:
                    newDefsource.length === 0 || (newDefsource.length > 0 && _.get(newDefsource, '0.cid'))
                      ? ''
                      : JSON.stringify(newDefsource),
                  hidetitle: '0',
                  titlesize: '',
                  titlestyle: '',
                  titlecolor: '',
                }),
              };
            } else {
              nextData = handleAdvancedSettingChange(nextData, { sorts: '' });
            }
            onChange(nextData);
          }}
        />
        {showtype === '3' && (
          <div className="labelWrap mTop12">
            <Checkbox
              className="displayCover"
              size="small"
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
                <i className="icon pointer icon-help Gray_9e Font16" />
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
                  const value = control.controlId ? `${control.controlName}：${text}` : '';
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
    </RelateSheetWrap>
  );
}
