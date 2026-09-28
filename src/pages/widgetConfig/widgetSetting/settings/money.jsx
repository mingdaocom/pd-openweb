import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { Segmented, Select } from 'ming-ui/antd-components';
import fixedDataAjax from 'src/api/fixedData';
import worksheetAjax from 'src/api/worksheet';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';
import PointerConfig from '../components/PointerConfig';
import PreSuffix from '../components/PreSuffix';

const getDisplayOptions = () => [
  { label: _l('货币符号'), value: '1' },
  { label: _l('货币代码'), value: '2' },
  { label: _l('自定义'), value: '0' },
];

export default function Money(props) {
  const { data = {}, onChange, globalSheetInfo = {} } = props;
  const { currency, showformat = '0', suffix, prefix } = getAdvanceSetting(data);
  const { currencycode } = safeParse(currency || '{}');
  const [currencyList, setList] = useState([]);
  const currentCurrency = _.find(currencyList, c => c.currencyCode === currencycode);
  const lang = getCurrentLangCode();

  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit && !(data.advancedSetting || {}).suffix) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }

    worksheetAjax.getWorksheetCurrencyInfos().then(res => {
      setList(res);
    });
    // 未保存获取默认值
    if (!currency && (data.controlId || '').includes('-')) {
      fixedDataAjax.getRegionConfigInfos({ projectId: globalSheetInfo.projectId }).then(res => {
        if (!_.isEmpty(res)) {
          onChange(
            handleAdvancedSettingChange(data, {
              currency: JSON.stringify({
                currencycode: _.get(res, 'currencyCode'),
                symbol: _.get(res, 'currencySymbol'),
              }),
              currencynames: JSON.stringify({
                0: _.get(res, 'currencyName.3') || '',
                1: _.get(res, 'currencyPluralNames.1') || '',
                2: _.get(res, 'currencyName.1') || '',
                3: _.get(res, 'subunits.1') || '',
                4: _.get(res, 'subunit.1') || '',
              }),
              ...(_.includes(['1', '2'], showformat) ? { suffix: '', prefix: '' } : {}),
            }),
          );
        }
      });
    }
  }, [data.controlId]);

  const isRepeat = () => {
    const currentFix = suffix || prefix;
    return _.find(currencyList, c => c.symbol === currentFix || c.currencyCode === currentFix);
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('金额类型')}</div>
        <Select
          className="w100"
          showPopupSearch
          value={currentCurrency ? currencycode : undefined}
          placeholder={_l('请选择')}
          allowClear
          options={currencyList.map(item => ({
            ...item,
            value: item.currencyCode,
            label: `${item.currencyCode}-${item.symbol} ${item.currencyName[lang]}`,
          }))}
          filterOption={(value, option) =>
            _.includes(_.get(option, ['currencyName', lang]), value) ||
            _.includes(option.currencyCode, value.toLocaleUpperCase()) ||
            _.includes(option.symbol, value)
          }
          optionRender={({ data: item }) => (
            <div className="flexRow alignItemsCenter justifyContentBetween">
              <span>
                {item.currencyCode}-{item.symbol}
              </span>
              <span className="countryName overflow_ellipsis mLeft10">{item.currencyName[lang]}</span>
            </div>
          )}
          onChange={(value, info) => {
            if (!value) {
              onChange(
                handleAdvancedSettingChange(data, {
                  currency: '',
                  currencynames: '',
                  ...(showformat !== '0' ? { showformat: '0', suffix: _l('元'), prefix: '' } : {}),
                }),
              );
              return;
            }

            onChange(
              handleAdvancedSettingChange(data, {
                currency: JSON.stringify({
                  currencycode: info.currencyCode,
                  symbol: info.symbol,
                }),
                currencynames: JSON.stringify({
                  0: _.get(info, 'currencyName.3') || '',
                  1: _.get(info, 'currencyNamePlural.1') || '',
                  2: _.get(info, 'currencyName.1') || '',
                  3: _.get(info, 'subCurrencyCodePlural.1') || '',
                  4: _.get(info, 'subCurrencyCode.1') || '',
                }),
                ...(_.includes(['1', '2'], showformat) ? { suffix: '', prefix: '' } : {}),
              }),
            );
          }}
        />
      </SettingItem>
      <PointerConfig {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Segmented
          block
          value={showformat}
          options={getDisplayOptions()}
          onChange={value => {
            onChange(
              handleAdvancedSettingChange(data, {
                showformat: value,
                ...(_.includes(['1', '2'], value) ? { suffix: '', prefix: '' } : { suffix: _l('元'), prefix: '' }),
              }),
            );
          }}
        />
      </SettingItem>
      {showformat === '0' && (
        <SettingItem>
          <PreSuffix {...props} />
          {isRepeat() && (
            <div className="Red mTop8" style={{ paddingLeft: '98px' }}>
              {_l('与系统类型重复')}
            </div>
          )}
        </SettingItem>
      )}
    </Fragment>
  );
}
