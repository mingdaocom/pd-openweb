import React, { Fragment, useEffect, useState } from 'react';
import { Dropdown } from 'antd';
import cx from 'classnames';
import fixedDataAjax from 'src/api/fixedData';
import worksheetAjax from 'src/api/worksheet';
import { AnimationWrap, DropdownContentWrap, DropdownPlaceholder, SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import PointerConfig from '../components/PointerConfig';
import PreSuffix from '../components/PreSuffix';

const DISPLAY_OPTIONS = [
  { text: _l('货币符号'), value: '1' },
  { text: _l('货币代码'), value: '2' },
  { text: _l('自定义'), value: '0' },
];

const SelectCountryDropdown = ({ data = [], lang, setData, setVisible }) => {
  const [value, setValue] = useState('');
  const filteredData = value
    ? data.filter(
        item =>
          item.currencyName[lang].includes(value) ||
          item.currencyCode.includes(value.toLocaleUpperCase()) ||
          item.symbol.includes(value),
      )
    : data;
  return (
    <DropdownContentWrap>
      <div className="searchWrap" onClick={e => e.stopPropagation()}>
        <i className="icon-search Font16 Gray_75"></i>
        <input
          autoFocus
          value={value}
          placeholder={_l('搜索')}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
      </div>
      {filteredData.length > 0 ? (
        <div className="countryContent">
          {filteredData.map(item => {
            return (
              <div
                key={item.currencyCode}
                className="item justityBetween"
                onClick={() => {
                  setData(item);
                  setVisible(false);
                }}
              >
                {item.currencyCode}-{item.symbol}
                <span className="countryName overflow_ellipsis InlineBlock" style={{ maxWidth: '50%' }}>
                  {item.currencyName[lang]}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="emptyText">{_l(value ? '暂无搜索结果' : _l('暂无可选项'))}</div>
      )}
    </DropdownContentWrap>
  );
};

export default function Money(props) {
  const { data = {}, onChange, globalSheetInfo = {} } = props;
  const { currency, showformat = '0', suffix, prefix } = getAdvanceSetting(data);
  const { currencycode } = safeParse(currency || '{}');
  const [currencyList, setList] = useState([]);
  const [visible, setVisible] = useState(false);
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

  const renderPlaceholder = () => {
    if (!currentCurrency) return <div className="placeholder">{_l('请选择')}</div>;
    return (
      <div className="text overflow_ellipsis">
        {`${currentCurrency.currencyCode}-${currentCurrency.symbol}`}
        <span className="mLeft10">{currentCurrency.currencyName[lang]}</span>
      </div>
    );
  };

  const isRepeat = () => {
    const currentFix = suffix || prefix;
    return _.find(currencyList, c => c.symbol === currentFix || c.currencyCode === currentFix);
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('金额类型')}</div>
        <Dropdown
          trigger={['click']}
          visible={visible}
          onVisibleChange={value => setVisible(value)}
          destroyPopupOnHide={true}
          overlay={
            <SelectCountryDropdown
              setVisible={setVisible}
              data={currencyList}
              lang={lang}
              setData={info => {
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
          }
        >
          <DropdownPlaceholder>
            {renderPlaceholder()}
            <i className="icon-arrow-down-border Font14 Gray_9e"></i>
          </DropdownPlaceholder>
        </Dropdown>
      </SettingItem>
      <PointerConfig {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <AnimationWrap>
          {DISPLAY_OPTIONS.map(({ text, value }) => {
            const isActive = showformat === value;
            return (
              <div
                className={cx('animaItem breakText', { active: isActive })}
                onClick={() => {
                  if (isActive) return;
                  onChange(
                    handleAdvancedSettingChange(data, {
                      showformat: value,
                      ...(_.includes(['1', '2'], value)
                        ? { suffix: '', prefix: '' }
                        : { suffix: _l('元'), prefix: '' }),
                    }),
                  );
                }}
              >
                {text}
              </div>
            );
          })}
        </AnimationWrap>
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
