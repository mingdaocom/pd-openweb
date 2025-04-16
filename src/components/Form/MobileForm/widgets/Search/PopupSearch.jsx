import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, PopupWrapper } from 'ming-ui';
import './index.less';

const MobileSearch = props => {
  const { enumDefault, controlName, value, loading, advancedSetting = {}, disabled, hint, formDisabled } = props;
  const { itemtitle = '', clicksearch, searchfirst, min = '0' } = advancedSetting;
  const optionData = (props.optionData || []).map((it, index) => ({ ...it, index }));

  const searchInput = useRef(null);
  const isOnComposition = useRef(false);
  const [visible, setVisible] = useState(false);
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
    let mobileOptionData =
      searchInput.current && searchInput.current.value && enumDefault === 1 ? mobileSearchResult : optionData;

    return _.get(searchInput.current || {}, 'value') && enumDefault === 1 && _.isEmpty(mobileSearchResult) ? (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <Icon icon="h5_search" className="Font50" />
        <div className="Gray_bd Font17 Bold mTop40">{_l('没有搜索结果')}</div>
      </div>
    ) : (
      <div className="flex searchResult">
        {mobileOptionData.map((item, i) => {
          return (
            <div
              key={i}
              className="flexRow searchItem alignItemsCenter"
              onClick={() => {
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
    if (enumDefault === 2) {
      searchInput.current && searchInput.current.focus();
    }
  }, [enumDefault]);

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
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>
      <PopupWrapper
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={controlName}
        onClose={() => {
          setVisible(false);
          if (searchInput.current) {
            searchInput.current.value = '';
          }
        }}
        onClear={() => {
          setVisible(false);
          if (searchInput.current) {
            searchInput.current.value = '';
          }
          props.onChange();
        }}
      >
        <div className="searchListModals">
          {enumDefault === 2 && clicksearch === '0' ? (
            <div className="searchBox GrayBGF8 selectSearchBox">
              <input
                ref={searchInput}
                type="text"
                className="cursorText flex Gray"
                placeholder={hint || _l('请选择')}
              />
              <div
                className="searchBtn"
                onClick={() => {
                  if (searchInput.current.value.length < parseInt(min)) return;
                  props.handleSearch(searchInput.current.value);
                }}
              >
                <Icon icon="search" className="Font18 Gray_75" />
              </div>
            </div>
          ) : (
            <div className="searchBox GrayBGF8">
              <Icon icon="search" className="searchIcon Font20 Gray_75" />
              <input
                type="text"
                className="cursorText Gray"
                placeholder={hint || _l('请选择')}
                ref={searchInput}
                onChange={e => {
                  const value = searchInput.current.value.trim();
                  // if (!value) {
                  //   props.clearData();
                  //   return;
                  // }
                  if (isOnComposition.current) return;
                  searchRealTime(value);
                }}
                onCompositionStart={() => (isOnComposition.current = true)}
                onCompositionEnd={event => {
                  const value = searchInput.current.value.trim();
                  if (event.type === 'compositionend') {
                    isOnComposition.current = false;
                  }
                  searchRealTime(value);
                }}
              />
            </div>
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

export default memo(MobileSearch);
