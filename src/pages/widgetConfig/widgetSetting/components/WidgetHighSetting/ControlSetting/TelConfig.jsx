import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Dropdown, Tooltip } from 'antd';
import { useSetState } from 'react-use';
import { isEqual } from 'lodash';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import { getAdvanceSetting } from '../../../../util';
import allData, { COMMON_DEFAULT_COUNTRY } from './telData';
import SelectDialog, { SelectCountryDropdown } from './SelectDialog';
import { DropdownPlaceholder } from '../../../../styled';

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
      border-color: #2196f3;
    }
  }
  .title {
    margin: 16px 0 8px 0;
  }
`;

export default function TelConfig({ data, onChange }) {
  const { enumDefault } = data;

  const [{ allowSelectVisible, commonUseVisible, defaultCountryVisible }, setVisible] = useSetState({
    allowSelectVisible: false,
    commonUseVisible: false,
    defaultCountryVisible: false,
  });

  const allowData = getAdvanceSetting(data, 'allowcountries') || [];
  const commonData = getAdvanceSetting(data, 'commcountries') || [];
  const defaultCountry = getAdvanceSetting(data, 'defaultarea') || {};

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

  const selectableCountry = allowData.length > 0 ? allowData : allData;

  const getCommonDisplayText = () => {
    if (commonData.length > 0) {
      if (commonData.length === COMMON_DEFAULT_COUNTRY.length && isEqual(commonData, COMMON_DEFAULT_COUNTRY)) {
        return <div className="text Gray_bd">{_l('默认')}</div>;
      }
      return <div className="text">{_l('%0个', commonData.length)}</div>;
    }
    return <div className="text Gray_bd">{_l('请选择')}</div>;
  };
  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={enumDefault === 0}
          onClick={checked => {
            onChange({ enumDefault: checked ? 1 : 0 });
          }}
        >
          <span>{_l('启用 国家/地区 选择')}</span>
          <Tooltip
            placement={'bottom'}
            title={_l('未启用时，默认输入中国号码，国际号码需要手动输入国家/地区代码。启用后，可选择国家/地区代码。')}
          >
            <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {enumDefault === 0 && (
        <TelConfigWrap>
          <div className="title">{_l('允许的国家/地区')}</div>
          <div className="allowSelectDisplay pointer" onClick={() => setVisible({ allowSelectVisible: true })}>
            <div className={cx('text', { Gray_bd: allowData.length < 1 })}>
              {allowData.length > 0 ? _l('%0个', allowData.length) : _l('全部')}
            </div>
          </div>
          <div className="title">{_l('默认的国家/地区')}</div>
          <Dropdown
            trigger={['click']}
            visible={defaultCountryVisible}
            onVisibleChange={visible => setVisible({ defaultCountryVisible: visible })}
            overlay={
              <SelectCountryDropdown
                unique
                selectableData={selectableCountry}
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
              <div className={cx('text', { Gray_bd: !defaultCountry.name })}>{defaultCountry.name || _l('请选择')}</div>
              <i className="icon-arrow-down-border Font14 Gray_9e"></i>
            </DropdownPlaceholder>
          </Dropdown>
          <div className="title">{_l('常用的国家/地区')}</div>
          <div className="commonUseDisplay pointer" onClick={() => setVisible({ commonUseVisible: true })}>
            {getCommonDisplayText()}
          </div>
        </TelConfigWrap>
      )}
      {allowSelectVisible && (
        <SelectDialog
          type="allowData"
          title={_l('允许的国家/地区')}
          data={allowData}
          onOk={list => {
            const nextCommonData = genNextCommonData(list);
            const area =
              list.length > 0
                ? list[0]
                : COMMON_DEFAULT_COUNTRY.find(o => o.iso2 === _.get(md, 'global.Config.DefaultConfig.initialCountry'));
            onChange({
              ...handleAdvancedSettingChange(data, {
                defaultarea: JSON.stringify(area),
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
