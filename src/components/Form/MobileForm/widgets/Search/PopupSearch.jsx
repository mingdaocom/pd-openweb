import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, MobileSearch } from 'ming-ui';
import { PopupWrapper } from 'ming-ui/antd-mobile-components';
import './index.less';

const PopupSearch = props => {
  const { enumDefault, controlName, value, loading, advancedSetting = {}, disabled, hint, formDisabled } = props;
  const { itemtitle = '', clicksearch, searchfirst, min = '0' } = advancedSetting;
  const optionData = (props.optionData || []).map((it, index) => ({ ...it, index }));
  const isManualSearch = enumDefault === 2 && clicksearch === '0';

  const searchRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [mobileSearchResult, setMobileSearchResult] = useState([]);

  const searchRealTime = value => {
    if (clicksearch === '1') {
      props.realTimeSearch(value);
    } else {
      let searchResult = optionData.filter(item => `${item[itemtitle]}`.indexOf(value) > -1);
      setMobileSearchResult(searchResult);
    }
  };

  const renderList = () => {
    let mobileOptionData = keywords && enumDefault === 1 ? mobileSearchResult : optionData;

    return keywords && enumDefault === 1 && _.isEmpty(mobileSearchResult) ? (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <Icon icon="h5_search" className="Font50" />
        <div className="textDisabled Font17 Bold mTop40">{_l('没有搜索结果')}</div>
      </div>
    ) : (
      <div className="flex searchResult">
        {mobileOptionData.map((item, i) => {
          return (
            <div
              key={i}
              className="flexRow searchItem alignItemsCenter"
              onClick={() => {
                resetSearch();
                setVisible(false);
                props.onChange(item[itemtitle]);
                props.handleSelect({
                  key: String(item.index),
                  value: item[itemtitle],
                  label: item[itemtitle],
                });
              }}
            >
              <div className="flex overflowHidden itemContent"> {props.renderListItem(item)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (visible && enumDefault === 2) searchRef.current?.focus();
  }, [visible, enumDefault]);

  const resetSearch = () => {
    setKeywords('');
    props.cancelSearch();
  };

  const handleKeywordSearch = value => {
    const trimmedValue = value.trim();
    setKeywords(trimmedValue);

    if (isManualSearch) {
      if (trimmedValue.length >= parseInt(min)) props.handleSearch(trimmedValue);
      return;
    }

    searchRealTime(trimmedValue);
  };

  return (
    <Fragment>
      <div
        className={cx('customFormControlBox controlMinHeight flexRow flexCenter', {
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
        onClick={() => {
          if (!disabled) {
            setVisible(true);
            if ((enumDefault === 2 && searchfirst === '1') || enumDefault === 1) {
              props.handleSearch('');
            }
          }
        }}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !value })}>{value || hint || _l('请选择')}</span>
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 textDisabled" />}
      </div>
      <PopupWrapper
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={controlName}
        onClose={() => {
          setVisible(false);
          resetSearch();
        }}
        onClear={() => {
          setVisible(false);
          resetSearch();
          props.onChange();
        }}
      >
        <div className="searchListModals">
          {visible && (
            <MobileSearch
              ref={searchRef}
              placeholder={hint || _l('请选择')}
              searchMode={isManualSearch ? 'manual' : 'realtime'}
              disabled={loading}
              onSearch={handleKeywordSearch}
            />
          )}
          {loading ? (
            <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
              <LoadDiv />
            </div>
          ) : (
            renderList()
          )}
        </div>
      </PopupWrapper>
    </Fragment>
  );
};

export default memo(PopupSearch);
