import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Select } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SetConfig, SettingItem } from '../../../styled';
import DialogMapping from './DaialogMapping';

const SELECT_OPTIONS = [
  {
    required: true,
    label: _l('选项列表'),
    placeholder: _l('请选择返回参数中的多条数据对象'),
    type: 1,
    key: 'itemsource',
  },
  { required: true, label: _l('选项名'), placeholder: _l('选择作为选项名的参数'), type: 2, key: 'itemtitle' },
  {
    required: false,
    label: _l('附加显示信息'),
    placeholder: _l('可多选，用于辅助用户选择'),
    type: 3,
    key: 'itemdesc',
  },
];

const MappingWrap = styled.div`
  .controlLabel {
    margin-top: 16px;
  }
  .requireIcon {
    position: absolute;
    color: var(--color-error);
    margin-top: 1px;
    left: -6px;
  }
`;

const renderSelectedCount = omittedValues => _l('选择%0项', omittedValues.length);

// 是普通数组
const isNormalArray = (controls = [], value) => {
  return (
    _.get(
      _.find(controls, i => i.controlId === value),
      'type',
    ) === 10000007
  );
};

export default function SearchMapping(props) {
  const { data = {}, responseControls = [], originResponseControls = [], onChange } = props;
  const { itemsource = '', itemtitle = '' } = getAdvanceSetting(data);
  const itemdesc = getAdvanceSetting(data, 'itemdesc') || [];
  const responsemap = getAdvanceSetting(data, 'responsemap') || [];
  const isDropdown = data.type === 50;

  const [mapVisible, setMapVisible] = useState(false);

  const getMapData = type => {
    let filterData = [];
    let dropValue = '';

    // 选项列表
    if (type === 1) {
      filterData = responseControls.filter(i => _.includes([10000007, 10000008], i.type) && !i.dataSource);
      dropValue = itemsource;
    } else {
      filterData = responseControls.filter(
        i =>
          i.dataSource === itemsource &&
          !_.includes([26, 27], i.type) &&
          !_.includes(type === 2 ? itemdesc : [itemtitle], i.controlId),
      );
      dropValue = type === 2 ? itemtitle : itemdesc;
    }

    return {
      dropData: filterData.map(({ controlId: value, controlName: label }) => ({
        value,
        label,
      })),
      dropValue,
    };
  };

  const handleChange = (value, item) => {
    if (item.type === 1) {
      onChange(
        handleAdvancedSettingChange(data, {
          [item.key]: value,
          ...(value !== itemsource ? { itemtitle: '', itemdesc: '' } : {}),
          ...(isNormalArray(responseControls, value)
            ? {
                itemtitle:
                  _.get(
                    _.find(originResponseControls, o => o.dataSource === value),
                    'controlId',
                  ) || '',
              }
            : {}),
        }),
      );
      return;
    }

    onChange(handleAdvancedSettingChange(data, { [item.key]: item.type === 3 ? JSON.stringify(value) : value }));
  };

  return (
    <Fragment>
      {isDropdown && (
        <SettingItem>
          <div className="settingItemTitle">{_l('将返回数据作为下拉框选项')}</div>
          {SELECT_OPTIONS.map((item, index) => {
            const { dropData = [], dropValue = '' } = getMapData(item.type);
            const id = `${item.key}_${index}`;
            const isMultiple = item.type === 3;
            return index === 0 || (itemsource && !isNormalArray(responseControls, itemsource)) ? (
              <MappingWrap id={id} key={id}>
                <div className="controlLabel ellipsis">
                  {item.required && <span className="requireIcon">*</span>}
                  {item.label}
                </div>
                <Select
                  className="w100 mTop8"
                  options={dropData}
                  mode={isMultiple ? 'multiple' : undefined}
                  value={isMultiple ? dropValue : dropValue || undefined}
                  placeholder={item.placeholder}
                  getPopupContainer={() => document.getElementById(id)}
                  maxTagCount={isMultiple ? 0 : undefined}
                  maxTagPlaceholder={isMultiple ? renderSelectedCount : undefined}
                  onChange={value => handleChange(value, item)}
                />
              </MappingWrap>
            ) : null;
          })}
        </SettingItem>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('将返回数据写入表单字段')}</div>
        <SetConfig $hasSet={responsemap.length} onClick={() => setMapVisible(true)}>
          {responsemap.length ? (
            <span>
              <i className="icon-check_circle"></i>
              {_l('已设置')}
            </span>
          ) : (
            <span>{_l('点击设置')}</span>
          )}
        </SetConfig>
      </SettingItem>

      {mapVisible && <DialogMapping {...props} onClose={() => setMapVisible(false)} />}
    </Fragment>
  );
}
