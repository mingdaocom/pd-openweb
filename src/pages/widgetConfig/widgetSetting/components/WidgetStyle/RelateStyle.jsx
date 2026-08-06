import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { AnimationWrap, SettingItem } from 'src/pages/widgetConfig/styled';
import { DISPLAY_FROZEN_LIST, DISPLAY_RC_TITLE_STYLE } from '../../../config/setting';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import TableConfig from './component/TableConfig';
import TreeTableLevel from './component/TreeTableLevel';

export default function RelateStyle(props) {
  const { data, onChange } = props;
  const {
    alternatecolor = '1',
    allowedit = '1',
    layercontrolid,
    showtype,
    titlewrap,
    rctitlestyle = '0',
    hidenumber,
    direction = '0',
    querytype,
    openstatistics,
  } = getAdvanceSetting(data);
  const freezeIds = getAdvanceSetting(data, 'freezeids') || [];
  const tableControls = _.get(data, 'relationControls') || [];
  const tableData = tableControls
    .filter(c => c.type === 29 && c.dataSource === data.dataSource && c.enumDefault === 1)
    .map(i => ({ value: i.controlId, text: i.controlName }));

  const isDelete = layercontrolid && !_.find(tableControls, t => t.controlId === layercontrolid);
  const isUnSupport =
    layercontrolid &&
    !_.find(tableData, t => t.value === layercontrolid) &&
    _.find(tableControls, t => t.controlId === layercontrolid);

  return (
    <Fragment>
      <TableConfig {...props} />

      <SettingItem hidden={direction === '1'}>
        <div className="settingItemTitle">{_l('冻结列')}</div>
        <Dropdown
          border
          value={freezeIds[0] || '0'}
          maxHeight={250}
          data={DISPLAY_FROZEN_LIST}
          onChange={value => {
            onChange(handleAdvancedSettingChange(data, { freezeids: value === '0' ? '' : JSON.stringify([value]) }));
          }}
        />
      </SettingItem>

      {data.type === 29 && _.includes(['5', '6'], showtype) && direction !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('树形表格')}
            {isUnSupport && (
              <Tooltip placement="bottom" title={_l('该关联记录字段不是一对多关系')}>
                <Icon className="Font20 mLeft8 Red" icon="error1" />
              </Tooltip>
            )}
          </div>
          <Dropdown
            border
            className={cx({ error: isUnSupport })}
            cancelAble
            placeholder={_l('选择关联表中的关联本表字段')}
            value={layercontrolid || undefined}
            data={tableData}
            renderTitle={() => {
              if (isDelete) return <span className="Red">{_l('已删除')}</span>;
              return _.get(
                _.find(tableControls, t => t.controlId === layercontrolid),
                'controlName',
              );
            }}
            noData={_l('未添加关联本表字段')}
            onChange={value => {
              if (layercontrolid === value) return;
              onChange(
                handleAdvancedSettingChange(data, {
                  layercontrolid: value || '',
                  ...(value
                    ? { showcount: '1', defaultlayer: '5', ...(openstatistics === '1' ? { openstatistics: '0' } : {}) }
                    : {}),
                }),
              );
            }}
          />
          <div className="mTop10 textTertiary">
            {_l('选择一个一对多关系的本表关联字段，数据将按此字段的父级（单条）、子级（多条）关系构成树形表格')}
          </div>
        </SettingItem>
      )}
      {layercontrolid && <TreeTableLevel {...props} />}
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={hidenumber !== '1'}
            text={_l('显示序号')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { hidenumber: String(+checked) }))}
          />
        </div>
        {querytype !== '1' && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowedit === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowedit: String(+!checked) }))}
            >
              <span style={{ marginRight: '4px' }}>{_l('允许行内编辑')}</span>
              <Tooltip placement="bottom" title={_l('无需打开记录详情，在表格行内直接编辑字段')}>
                <i className="icon-help textTertiary Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
        )}
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={alternatecolor === '1'}
            text={_l('显示交替行颜色')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { alternatecolor: String(+!checked) }))}
          />
        </div>
        {direction !== '1' && (
          <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
            <div className="labelWrap LineHeight36 mTop0">
              <Checkbox
                size="small"
                checked={titlewrap === '1'}
                text={_l('标题行文字换行')}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { titlewrap: String(+!checked) }))}
              />
            </div>
            {titlewrap === '1' && (
              <AnimationWrap style={{ width: '112px' }}>
                {DISPLAY_RC_TITLE_STYLE.map(({ icon, value, text }) => {
                  return (
                    <Tooltip title={text}>
                      <div
                        className={cx('animaItem', { active: rctitlestyle === value })}
                        onClick={() => {
                          onChange(
                            handleAdvancedSettingChange(data, {
                              rctitlestyle: value,
                            }),
                          );
                        }}
                      >
                        <Icon icon={icon} className="Font18" />
                      </div>
                    </Tooltip>
                  );
                })}
              </AnimationWrap>
            )}
          </div>
        )}
      </SettingItem>
    </Fragment>
  );
}
