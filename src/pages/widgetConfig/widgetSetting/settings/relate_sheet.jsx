import React, { useEffect, Fragment } from 'react';
import { useSetState } from 'react-use';
import { get, isEmpty } from 'lodash';
import { RadioGroup, Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
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
import { EditInfo, InfoWrap, SettingItem } from '../../styled';
import { useSheetInfo } from '../../hooks';
import components from '../components';
import { formatViewToDropdown } from '../../util';
import sheetComponents from '../components/relateSheet';
import { SYSTEM_CONTROL } from '../../config/widget';
import { FilterItemTexts, FilterDialog } from '../components/FilterData';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import { WHOLE_SIZE } from '../../config/Drag';
import WidgetVerify from '../components/WidgetVerify';

const { ConfigRelate, BothWayRelate, SearchConfig } = sheetComponents;
const { SheetDealDataType, RelateSheetInfo } = components;

const RelateSheetWrap = styled.div`
  .filterBtn {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

export default function RelateSheet(props) {
  let { from, data, deleteWidget, onChange, globalSheetInfo, saveControls, allControls, globalSheetControls } = props;
  const { worksheetId: sourceId, appId: defaultAppId } = globalSheetInfo;
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
  } = data;
  const [{ isRelateView, searchVisible, filterVisible }, setState] = useSetState({
    isRelateView: Boolean(viewId),
    filterVisible: false,
    searchVisible: false,
  });
  let {
    showtype = String(enumDefault),
    allowlink,
    allowcancel = '1',
    controlssorts = '[]',
    ddset,
    searchcontrol = '',
    dismanual = 0,
  } = getAdvanceSetting(data);
  const filters = getAdvanceSetting(data, 'filters');
  const searchfilters = getAdvanceSetting(data, 'searchfilters');
  const strDefault = data.strDefault || '000';

  const [isHiddenOtherViewRecord, disableAlbum, onlyRelateByScanCode] = strDefault.split('');

  const {
    loading,
    data: { info: worksheetInfo = {}, views = [], controls = [] },
  } = useSheetInfo({ worksheetId: dataSource });

  useEffect(() => {
    //  切换控件手动更新
    if (!loading && !isEmpty(controls)) {
      onChange({ relationControls: controls, sourceEntityName: worksheetInfo.name });
    }
    if (!getAdvanceSetting(data, 'showtype')) {
      onChange(handleAdvancedSettingChange(data, { showtype: '1' }));
    }
  }, [dataSource, loading, data.controlId, enumDefault]);

  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.value === viewId);

  const isListDisplay = String(showtype) === '2';
  const filterControls = _.filter(relationControls, item => !_.includes([22, 43, 45, 47, 49], item.type));
  const titleControl = _.find(filterControls, item => item.attribute === 1);

  useEffect(() => {
    setState({ isRelateView: Boolean(viewId) });
    if (!showControls) {
      onChange({ showControls: filterControls.slice(0, 4).map(item => item.controlId) });
    }
    if (_.isUndefined(allowlink)) {
      onChange(handleAdvancedSettingChange(data, { allowlink: '1' }));
    }
  }, [controlId]);
  const isSheetDisplay = () => {
    return showtype === '2';
  };

  const getShowControls = () => {
    if (!showControls) return filterControls.slice(0, 4).map(item => item.controlId);
    // 删除掉showControls 中已经被删掉的控件
    const allControlId = controls.map(item => item.controlId);
    return showControls
      .map(id => {
        if (!allControlId.includes(id)) return '';
        return id;
      })
      .filter(item => !isEmpty(item));
  };

  if (!showControls && !isEmpty(filterControls)) {
    onChange({ showControls: getShowControls() });
  }

  const deleteDeletedControls = () => {
    try {
      if (!filters) {
        return;
      }
      const newFilters = JSON.parse(filters).filter(filter =>
        _.includes(
          relationControls.map(rc => rc.controlId),
          filter.controlId,
        ),
      );
      onChange(handleAdvancedSettingChange(data, { filters: JSON.stringify(newFilters) }));
    } catch (err) {}
  };

  const getGhostControlId = () => {
    if (isSheetDisplay() || !titleControl) return [];
    return [titleControl.controlId];
  };

  return (
    <RelateSheetWrap>
      {dataSource ? (
        <RelateSheetInfo name={sourceEntityName || worksheetInfo.name} id={dataSource} />
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
          size="middle"
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
              nextData = { ...nextData };
            } else {
              nextData = handleAdvancedSettingChange(nextData, { searchfilters: '' });
            }
            // 切换为列表 必填置为false, 默认值清空
            if (value === '2') {
              nextData = {
                ...nextData,
                required: false,
                advancedSetting: Object.assign(nextData.advancedSetting, { defsource: '', hidetitle: '0' }),
              };
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
        <Fragment>
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
          </SettingItem>
          <SettingItem className="selectPicOfRecord">
            <div className="settingItemTitle mBottom8">
              <span style={{ fontWeight: 'normal' }}>
                {enumDefault === 1 ? _l('封面图片') : _l('封面图片（移动端和分享时）')}
              </span>
              <Tooltip
                className="hoverTip"
                title={
                  <span>
                    {enumDefault === 1
                      ? _l('在卡片中显示所选附件字段中最新上传的一张可预览文件。')
                      : _l(
                          '在移动端和分享记录时，列表将以卡片形式进行呈现。在卡片中显示所选附件字段中最新上传的一张可预览文件',
                        )}
                  </span>
                }
                popupPlacement="bottom"
              >
                <i className="icon pointer icon-help Gray_bd Font15" />
              </Tooltip>
            </div>
            <Dropdown
              border
              disabled={!dataSource}
              loading={loading}
              renderTitle={item => (!item || item.value === 'none' ? '' : item.text)}
              data={[
                {
                  text: _l('清除'),
                  value: 'none',
                  className: 'Gray_9e ThemeHoverColor3',
                },
              ].concat(
                filterControls
                  .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
                  .map(c => ({
                    text: c.controlName,
                    value: c.controlId,
                  })),
              )}
              value={coverCid || 'none'}
              onChange={value => {
                onChange({
                  coverCid: value === 'none' ? undefined : value,
                });
              }}
            />
          </SettingItem>
        </Fragment>
      )}
      <DynamicDefaultValue {...props} titleControl={titleControl} />
      {showtype !== '2' && <WidgetVerify {...props} />}
      <SettingItem>
        <div className="settingItemTitle">{_l('操作')}</div>
        <div className="labelWrap" style={{ justifyContent: 'space-between' }}>
          <Checkbox
            className="allowSelectRecords InlineBlock Gray"
            size="small"
            text={_l('允许选择已有记录')}
            disabled={showtype === '3'}
            checked={_.includes([0, 1], enumDefault2)}
            onClick={checked => {
              // enumDefault2使用两位数代表两个字段的布尔值 所以此处有恶心判断
              if (checked) {
                onChange({
                  enumDefault2: enumDefault2 === 0 ? 10 : 11,
                });
              } else {
                onChange({
                  enumDefault2: enumDefault2 === 10 ? 0 : 1,
                });
              }
            }}
          />
          {_.includes([0, 1], enumDefault2) && (
            <Tooltip
              title={
                <span>
                  {!filters || !filters.length || filters.length <= 0
                    ? _l('过滤允许选择的记录')
                    : _l('点击取消过滤条件')}
                </span>
              }
              placement="bottomRight"
              arrowPointAtCenter={true}
            >
              <span
                className="InlineBlock LineHeight20 TxtTop mLeft10 filterBtn Hand"
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
                <i className={cx('icon-worksheet_filter Font16', { ThemeColor3: filters && filters.length })}></i>
              </span>
            </Tooltip>
          )}
        </div>
        {filterVisible && (
          <FilterDialog
            {...props}
            supportGroup
            relationControls={controls}
            globalSheetControls={globalSheetControls}
            fromCondition={'relateSheet'}
            allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
            onChange={({ filters }) => {
              onChange(handleAdvancedSettingChange(data, { filters: JSON.stringify(filters) }));
              setState({ filterVisible: false });
            }}
            onClose={() => setState({ filterVisible: false })}
          />
        )}
        {!isEmpty(getAdvanceSetting(data, 'filters')) && (
          <FilterItemTexts
            {...props}
            globalSheetControls={globalSheetControls}
            loading={loading}
            controls={controls}
            allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
            editFn={() => setState({ filterVisible: true })}
          />
        )}

        <div className="labelWrap">
          <Checkbox
            className="allowSelectRecords "
            size="small"
            text={_l('允许新增关联记录')}
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
        {enumDefault === 2 && isListDisplay && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={_l('允许取消现有关联')}
              checked={allowcancel !== '0'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowcancel: checked ? '0' : '1' }))}
            />
          </div>
        )}
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许查看记录')}
            checked={+allowlink}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowlink: +!checked }))}
          />
        </div>
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
            text={_l('查询设置')}
          />
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
                    '设置关联视图，根据视图来控制用户的选择范围和对关联记录的查看、操作权限。以及列表显示时的默认显示排序规则',
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
            hint={_l('选择视图')}
            noneContent={_l('请先选择关联表')}
            selectName={selectedViewIsDeleted ? _l('视图已删除，请重新选择') : ''}
            data={dataSource ? formatViewToDropdown(views) : []}
            value={viewId === '' ? undefined : viewId}
            onChange={value => {
              onChange({ viewId: value });
            }}
          />
        )}
        {showtype === '2' && (
          <div className="labelWrap">
            <Checkbox
              className="allowSelectRecords"
              size="small"
              text={_l('按用户权限查看')}
              checked={!!+isHiddenOtherViewRecord}
              onClick={checked =>
                onChange({
                  strDefault: updateConfig({
                    config: strDefault,
                    value: +!checked,
                    index: 0,
                  }),
                })
              }
            >
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
        )}
      </SettingItem>
      {dataSource !== sourceId && (
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
          {_l('限制移动端输入')}
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
      )}
    </RelateSheetWrap>
  );
}
