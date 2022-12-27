import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Menu, MenuItem, LoadDiv, Dropdown, Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import worksheetAjax from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import { getSortData } from 'src/pages/worksheet/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import SheetComponents from '../components/relateSheet';
import { EditInfo, InfoWrap, SettingItem, WidgetIntroWrap } from '../../styled';
import { getControlsSorts, getDefaultShowControls, handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';
import {
  canSetAsTitle,
  getAdvanceSetting,
  resortControlByColRow,
  dealControlData,
  formatSearchConfigs,
} from '../../util';
import subListComponents from '../components/sublist';
import _, { isEmpty, find, filter, findIndex } from 'lodash';
import { DEFAULT_INTRO_LINK } from '../../config';
import { DEFAULT_SETTING_OPTIONS } from '../../config/setting';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import WidgetVerify from '../components/WidgetVerify';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
const { AddSubList, ConfigureControls, Sort } = subListComponents;

const SettingModelWrap = styled.div`
  .transferToRelate {
    position: absolute;
    top: 0;
    right: 0;
  }
  .targetEle .Dropdown--input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ccc;
    line-height: 34px;
    padding: 0 12px;
    border-radius: 3px;
  }
`;

export default function SubListSetting(props) {
  const { status, allControls, info, data, globalSheetInfo, onChange } = props;
  const { widgetName, icon, intro, moreIntroLink } = info;
  const { worksheetId: currentWorksheetId } = globalSheetInfo;
  const { controlId, dataSource, relationControls = [], showControls = [], advancedSetting = {} } = data;
  const { allowadd, allowsingle } = advancedSetting;
  const batchcids = getAdvanceSetting(data, 'batchcids') || [];
  const [sheetInfo, setInfo] = useState({});
  const [subQueryConfigs, setSubQueryConfigs] = useState([]);
  const [subListMode, setMode] = useState('new');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(batchcids.length > 0);

  const [{ setTitleVisible, switchVisible, sortVisible }, setConfig] = useSetState({
    setTitleVisible: false,
    switchVisible: false,
    sortVisible: false,
  });
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];
  const worksheetControls = relationControls
    .filter(item => item.type === 29)
    .map(({ controlId: value, controlName: text }) => ({ value, text }));

  useEffect(() => {
    setVisible(batchcids.length > 0);
    if (dataSource && window.subListSheetConfig[controlId]) {
      const { sheetInfo, subQueryConfigs = [] } = window.subListSheetConfig[controlId] || {};
      setInfo(sheetInfo);
      setSubQueryConfigs(subQueryConfigs);
    }
  }, [controlId]);

  useEffect(() => {
    // 兼容老数据
    if (_.isUndefined(allowsingle) && !batchcids.length) {
      onChange(handleAdvancedSettingChange(data, { allowsingle: '1' }));
    }
  }, [allowsingle]);

  useEffect(() => {
    const { saveIndex } = status;
    if ((window.subListSheetConfig[controlId] || {}).saveIndex === saveIndex) {
      return;
    }
    if (saveIndex && dataSource && !dataSource.includes('-')) {
      setLoading(true);
      worksheetAjax
        .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true })
        .then(res => {
          const controls = _.get(res, ['template', 'controls']);
          const saveData = _.find(allControls, i => i.controlId === data.controlId);

          // 关联表子表因为无法新增字段 所以不需要更新relationControls
          if (res.type !== 2) return;
          const { showControls } = allControls.find(item => item.controlId === controlId);
          onChange({
            ...saveData,
            relationControls: dealControlData(controls),
            showControls,
          });
          window.subListSheetConfig = {
            [controlId]: {
              status: true,
              mode: res.type === 2 ? 'new' : 'relate',
              saveIndex,
              sheetInfo: res,
            },
          };
          getQueryConfigs(res);
        })
        .always(() => {
          setLoading(false);
        });
    }
  }, [status.saveIndex]);

  const getQueryConfigs = ({ isWorksheetQuery, worksheetId }) => {
    if (isWorksheetQuery) {
      worksheetAjax.getQueryBySheetId({ worksheetId }).then(res => {
        const formatSearchData = formatSearchConfigs(res);
        setSubQueryConfigs(formatSearchData);
        window.subListSheetConfig[controlId] = {
          ...(window.subListSheetConfig[controlId] || {}),
          subQueryConfigs: formatSearchData || [],
        };
      });
    }
  };

  const updateSubQueryConfigs = (value = {}, mode) => {
    const index = findIndex(subQueryConfigs, item => item.controlId === value.controlId);
    let newQueryConfigs = subQueryConfigs.slice();
    if (mode) {
      index > -1 && newQueryConfigs.splice(index, 1);
    } else {
      index > -1 ? newQueryConfigs.splice(index, 1, value) : newQueryConfigs.push(value);
    }
    setSubQueryConfigs(newQueryConfigs);
  };

  const filterRelationControls = info => {
    return (_.get(info, ['template', 'controls']) || []).filter(item => !_.includes([45, 47, 49], item.type));
  };

  useEffect(() => {
    if (!dataSource) return;
    // 从空白创建的子表
    if (dataSource.includes('-')) {
      setMode('new');
      return;
    }
    if ((window.subListSheetConfig[controlId] || {}).status) {
      setMode(_.get(window.subListSheetConfig[controlId], 'mode'));
      return;
    }
    setLoading(true);
    worksheetAjax
      .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true })
      .then(res => {
        const controls = filterRelationControls(res);
        const defaultShowControls = getDefaultShowControls(controls);
        setInfo(res);
        window.subListSheetConfig[controlId] = {
          status: true,
          mode: res.type === 2 ? 'new' : 'relate',
          saveIndex: status.saveIndex,
          sheetInfo: res,
        };
        setMode(res.type === 2 ? 'new' : 'relate');
        let oriShowControls = isEmpty(showControls) ? defaultShowControls : showControls;
        let nextData = {
          showControls:
            res.type === 2 ? oriShowControls.filter(i => !_.includes(['caid', 'utime', 'ctime'], i)) : oriShowControls,
        };
        // if ([0, 1].includes(res.type)) {
        nextData = { ...nextData, relationControls: dealControlData(controls) };
        // }
        // 子表工作表查询
        getQueryConfigs(res);
        onChange(nextData);
      })
      .always(() => {
        setLoading(false);
      });
  }, [dataSource]);

  const onOk = ({ createType, sheetId, appId, controlName }) => {
    // 从空白创建时,创建一个占位dataSource
    if (createType === '1') {
      onChange({ dataSource: uuidv4() });
    } else {
      onChange({ appId, dataSource: sheetId, controlName });
    }
  };

  const switchType = type => {
    if (type === 'relate') {
      Dialog.confirm({
        title: _l('将子表转为关联记录'),
        description: _l('将子表字段转为关联记录字段'),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            type: 29,
          });
        },
      });
      return;
    }
    const isHaveCanSetAsTitle = _.some(relationControls, canSetAsTitle);
    if (isHaveCanSetAsTitle) {
      Dialog.confirm({
        title: _l('将子表转为工作表'),
        description: _l(
          '将从空白创建的子表转为一个实体工作表。此工作表将成为当前表单的一个关联子表，并可以在应用配置、流程、权限中被使用',
        ),
        okText: _l('确定'),
        onOk: () => {
          setMode('relate');
          if (window.subListSheetConfig[controlId]) {
            window.subListSheetConfig[controlId].mode = 'relate';
          }
          appManagementAjax
            .changeSheet({
              sourceWorksheetId: currentWorksheetId,
              worksheetId: dataSource,
              name: data.controlName,
            })
            .then(res => {
              if (res) {
                alert(_l('转换成功'));
              }
            });
        },
      });
    } else {
      setConfig({ setTitleVisible: true });
    }
  };

  const getConfigContent = () => {
    if (loading) return <LoadDiv />;
    if (subListMode === 'new') {
      return (
        <Fragment>
          <div className="settingItemTitle">{_l('字段')}</div>
          {dataSource ? (
            <ConfigureControls
              {...props}
              subQueryConfigs={subQueryConfigs}
              updateSubQueryConfigs={updateSubQueryConfigs}
              controls={filter(
                showControls.map(id => find(relationControls, item => item.controlId === id)),
                item => !isEmpty(item),
              )}
            />
          ) : (
            <LoadDiv />
          )}
        </Fragment>
      );
    }
    const sortedControls = resortControlByColRow(dealControlData(filterRelationControls(sheetInfo)));
    return (
      <Fragment>
        <div className="settingItemTitle">{_l('显示字段')}</div>
        {!_.isEmpty(relationControls) && (
          <SortColumns
            min1msg={_l('至少显示一列')}
            showControls={showControls}
            columns={sortedControls}
            controlsSorts={getControlsSorts(data, sortedControls)}
            onChange={({ newShowControls, newControlSorts }) => {
              const nextShowControls = newControlSorts.filter(item => _.includes(newShowControls, item));
              onChange({
                ...handleAdvancedSettingChange(data, {
                  controlssorts: JSON.stringify(newControlSorts),
                }),
                showControls: nextShowControls,
              });
            }}
          />
        )}
      </Fragment>
    );
  };

  return (
    <SettingModelWrap>
      <WidgetIntroWrap>
        {subListMode === 'new' ? (
          <div className="title relative">
            <i className={cx('icon Font20', `icon-${icon}`)} />
            <span>{widgetName}</span>
            <Tooltip placement={'bottom'} title={intro}>
              <span
                className="iconWrap pointer"
                onClick={() => {
                  window.open(moreIntroLink || DEFAULT_INTRO_LINK);
                }}
              >
                <i className="icon-help Gray_9e Font16"></i>
              </span>
            </Tooltip>
            <div className="transferToSheet" onClick={() => switchType('new')}>
              {_l('转为工作表')}
            </div>
          </div>
        ) : (
          <div className="title relative">
            <i className={cx('icon Font20', `icon-${icon}`)} />
            <span>{widgetName}</span>
            <Tooltip placement={'bottom'} title={intro}>
              <span
                className="iconWrap pointer"
                onClick={() => {
                  window.open(moreIntroLink || DEFAULT_INTRO_LINK);
                }}
              >
                <i className="icon-help Gray_9e Font16"></i>
              </span>
            </Tooltip>
            <div className="transferToRelate">
              <span data-tip={_l('变更类型')} onClick={() => setConfig({ switchVisible: true })}>
                <i className="icon icon-swap_horiz pointer Font22" />
              </span>
              {switchVisible && (
                <Menu className={cx('introSwitchMenu')} onClickAway={() => setConfig({ switchVisible: false })}>
                  <MenuItem onClick={() => switchType('relate')} icon={<i className="icon-link-worksheet" />}>
                    {_l('关联记录')}
                  </MenuItem>
                </Menu>
              )}
            </div>
          </div>
        )}
      </WidgetIntroWrap>
      <Components.WidgetName {...props} />
      {!dataSource && <AddSubList {...props} onOk={onOk} />}
      {subListMode !== 'new' && <Components.RelateSheetInfo name={sheetInfo.name} id={sheetInfo.worksheetId} />}
      <SettingItem>{getConfigContent()}</SettingItem>
      <WidgetVerify {...props} />
      {relationControls.length > 0 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排序')}</div>
          <EditInfo className="pointer subListSortInput" onClick={() => setConfig({ sortVisible: true })}>
            <div className="overflow_ellipsis Gray">
              {sorts.length > 0
                ? sorts.reduce((p, item) => {
                    const sortsRelationControls = relationControls
                      .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                      .concat(SYSTEM_CONTROLS);
                    const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
                    const flag = item.isAsc === true ? 2 : 1;
                    const { text } = getSortData(control.type, control).find(item => item.value === flag);
                    const value = control.controlId ? _l('%0: %1', control.controlName, text) : '';
                    return p ? `${p}；${value}` : value;
                  }, '')
                : _l('创建时间-最旧的在前')}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
          {sortVisible && (
            <Sort {...props} controls={relationControls} onClose={() => setConfig({ sortVisible: false })} />
          )}
        </SettingItem>
      )}
      <DynamicDefaultValue {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('操作')}</div>
        {DEFAULT_SETTING_OPTIONS.map(item => {
          return (
            <Checkbox
              className="mTop4 Block"
              size="small"
              text={item.text}
              checked={advancedSetting[item.id] === '1'}
              onClick={checked =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    [item.id]: checked ? '0' : '1',
                  }),
                )
              }
            />
          );
        })}
      </SettingItem>
      {allowadd === '1' && (
        <SettingItem>
          <div className="settingItemTitle Normal">{_l('新增方式')}</div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowsingle === '1'}
              text={_l('单行添加')}
              onClick={checked => {
                if (checked && !batchcids.length) return;
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowsingle: checked ? '0' : '1',
                  }),
                );
              }}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={visible}
              text={_l('批量选择添加')}
              onClick={checked => {
                if (checked && allowsingle !== '1') return;
                setVisible(!checked);
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      batchcids: JSON.stringify([]),
                    }),
                  );
                }
              }}
            >
              <Tooltip
                placement={'bottom'}
                title={_l(
                  '如：在添加订单明细时需要先选择关联的产品。此时您可以设置为从产品字段添加明细。设置后，您可以直接一次选择多个产品，并为每个产品都添加一行订单明细',
                )}
              >
                <i className="icon-help Gray_bd Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
          {visible && (
            <Dropdown
              border
              style={{ marginTop: '10px' }}
              trigger={['click']}
              placeholder={_l('选择子表中的关联记录字段')}
              noneContent={_l('没有可选字段')}
              value={batchcids[0] || undefined}
              data={worksheetControls}
              onChange={value => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    batchcids: JSON.stringify([value]),
                  }),
                );
              }}
            />
          )}
        </SettingItem>
      )}
      {subListMode !== 'new' && dataSource !== currentWorksheetId && (
        <SheetComponents.BothWayRelate
          worksheetInfo={sheetInfo}
          onOk={obj => {
            onChange(update(data, { sourceControl: { $set: { ...obj, type: 29 } } }));
          }}
          {...props}
        />
      )}
      {setTitleVisible && <Components.NoTitleControlDialog onClose={() => setConfig({ setTitleVisible: false })} />}
    </SettingModelWrap>
  );
}
