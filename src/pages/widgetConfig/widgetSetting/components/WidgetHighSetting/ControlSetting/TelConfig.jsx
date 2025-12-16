import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dropdown } from 'antd';
import cx from 'classnames';
import { isEqual } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import fixedDataController from 'src/api/fixedData';
import { DropdownPlaceholder, SettingItem } from '../../../../styled';
import { getAdvanceSetting } from '../../../../util';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import SelectDialog, { SelectCountryDropdown } from './SelectDialog';
import allData, { COMMON_DEFAULT_COUNTRY } from './telData';

const TelConfigWrap = styled.div`
  .allowSelectDisplay,
  .commonUseDisplay {
    margin: 6px 0;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    &:hover {
      border-color: #1677ff;
    }
  }
  .title {
    margin: 16px 0 8px 0;
  }
`;

export default function TelConfig({ data, onChange, globalSheetInfo = {} }) {
  const { enumDefault = 0 } = data;

  const [{ allowSelectVisible, commonUseVisible, defaultCountryVisible }, setVisible] = useSetState({
    allowSelectVisible: false,
    commonUseVisible: false,
    defaultCountryVisible: false,
  });

  const allowData = getAdvanceSetting(data, 'allowcountries') || [];
  const commonData = getAdvanceSetting(data, 'commcountries') || [];
  const defaultCountry = getAdvanceSetting(data, 'defaultarea') || {};

  useEffect(() => {
    if (enumDefault === 0 && _.isEmpty(defaultCountry)) {
      fixedDataController.getRegionConfigInfos({ projectId: globalSheetInfo.projectId }).then(res => {
        let code = 'CN';
        if (!_.isEmpty(res)) {
          code = _.get(res, 'code');
        }
        const defaultGeoCountry = _.find(allData, a => a.iso2 === code.toLocaleLowerCase());
        if (defaultGeoCountry) {
          onChange(
            handleAdvancedSettingChange(data, {
              defaultarea: JSON.stringify(defaultGeoCountry),
            }),
          );
        }
      });
    }
  }, [data.controlId]);

  const getCommonData = () => {
    if (commonData.length > 0) return commonData;
    // 未选择允许国家 则使用默认
    if (allData.length < 1) return COMMON_DEFAULT_COUNTRY;
    return commonData;
  };
  const getCommonOnlyCountry = () => {
    // 设置了允许的国家就从允许的国家中选择  否则从全部国家中选择
    return allowData.length > 0 ? allowData : allData;
    // 已经设置过常用的,可选项中排除掉不显示
    // return commonData.length > 0 ? data.filter(item => !commonData.some(({ iso2 }) => item.iso2 === iso2)) : data;
  };

  // 根据允许的国家生成常用的国家
  const genNextCommonData = list => {
    if (list.length < 1) return [];
    return commonData.reduce((p, c) => {
      return list.some(item => item.iso2 === c.iso2) ? p.concat(c) : p;
    }, []);
  };

  const getCommonDisplayText = () => {
    if (commonData.length > 0) {
      if (commonData.length === COMMON_DEFAULT_COUNTRY.length && isEqual(commonData, COMMON_DEFAULT_COUNTRY)) {
        return <div className="text Gray_75">{_l('默认')}</div>;
      }
      return <div className="text">{_l('%0个', commonData.length)}</div>;
    }
    return <div className="text Gray_bd">{_l('请选择')}</div>;
  };
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('默认区号')}</div>
        <Dropdown
          trigger={['click']}
          visible={defaultCountryVisible}
          onVisibleChange={visible => setVisible({ defaultCountryVisible: visible })}
          overlay={
            <SelectCountryDropdown
              style={{ width: '300px' }}
              unique
              selectableData={allData}
              setData={item => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    defaultarea: JSON.stringify(item),
                  }),
                );
                setVisible({ defaultCountryVisible: false });
              }}
            />
          }
        >
          <DropdownPlaceholder>
            <div className={cx('text', { Gray_bd: !defaultCountry.name })}>
              {defaultCountry.name ? `+${defaultCountry.dialCode} ${defaultCountry.name}` : _l('请选择')}
            </div>
            <i className="icon-arrow-down-border Font14 Gray_9e"></i>
          </DropdownPlaceholder>
        </Dropdown>
      </SettingItem>
      <div className="labelWrap mTop16">
        <Checkbox
          size="small"
          checked={enumDefault === 0}
          onClick={checked => {
            onChange({ enumDefault: checked ? 1 : 0 });
          }}
        >
          <span>{_l('启用 国家/地区 选择')}</span>
        </Checkbox>
      </div>
      {enumDefault === 0 && (
        <TelConfigWrap>
          <div className="title">{_l('允许选择的国家/地区')}</div>
          <div className="allowSelectDisplay pointer" onClick={() => setVisible({ allowSelectVisible: true })}>
            <div className={cx('text', { Gray_75: allowData.length < 1 })}>
              {allowData.length > 0 ? _l('%0个', allowData.length) : _l('全部')}
            </div>
          </div>
          <div className="title">
            {_l('常用的国家/地区')}
            <Tooltip placement="bottom" title={_l('常用的将优先显示在选择列表')}>
              <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
            </Tooltip>
          </div>
          <div className="commonUseDisplay pointer" onClick={() => setVisible({ commonUseVisible: true })}>
            {getCommonDisplayText()}
          </div>
        </TelConfigWrap>
      )}
      {allowSelectVisible && (
        <SelectDialog
          type="allowData"
          title={_l('允许选择的国家/地区')}
          data={allowData}
          onOk={list => {
            const nextCommonData = genNextCommonData(list);
            onChange({
              ...handleAdvancedSettingChange(data, {
                allowcountries: JSON.stringify(list),
                commcountries: JSON.stringify(nextCommonData),
              }),
            });
            setVisible({ allowSelectVisible: false });
          }}
          onCancel={() => setVisible({ allowSelectVisible: false })}
        />
      )}
      {commonUseVisible && (
        <SelectDialog
          type="common"
          title={_l('常用的国家/地区')}
          data={getCommonData()}
          selectableData={getCommonOnlyCountry()}
          onOk={list => {
            onChange(handleAdvancedSettingChange(data, { commcountries: JSON.stringify(list) }));
            setVisible({ commonUseVisible: false });
          }}
          onCancel={() => setVisible({ commonUseVisible: false })}
        />
      )}
    </Fragment>
  );
}
