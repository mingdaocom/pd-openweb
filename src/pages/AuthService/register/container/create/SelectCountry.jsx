import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Dropdown } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData';

export default function RegionDropdown(props) {
  const { onChange, onVisibleChange } = props;
  const [{ loading, geoCountryRegionCode, country, keywords, searchResultCountry }, setState] = useSetState({
    geoCountryRegionCode: props.geoCountryRegionCode,
    country: [],
    searchResultCountry: [],
    keywords: '',
    loading: false,
  });

  const searchRef = useRef();

  searchRef.current = useCallback(
    _.debounce(async searchKeywords => {
      if (loading) return;
      setState({ loading: true });
      fixedDataAjax
        .getCitysByParentID({
          langType: window.getCurrentLangCode(),
          layer: 0,
          keywords: searchKeywords,
        })
        .then(res => {
          const countryData = _.get(res, 'citys', []).map(l => ({ ...l, text: l.name, value: l.id }));
          if (searchKeywords) {
            setState({ searchResultCountry: countryData, loading: false });
          } else {
            setState({ country: countryData, loading: false });
          }
        })
        .catch(error => {
          console.error('Search failed:', error);
          setState({ loading: false });
        });
    }, 500),
    [loading],
  );

  useEffect(() => {
    searchRef.current('');
  }, []);

  const onChangRegionCode = code => {
    setState({ geoCountryRegionCode: code });
    onChange(code);
  };

  const handleSearch = newKeywords => {
    setState({ keywords: newKeywords });
    if (newKeywords) {
      searchRef.current(newKeywords);
    }
  };

  const currentCountry = _.find(country, v => v.id === geoCountryRegionCode) || {};

  return (
    <Dropdown
      className={'w100 controlDropdown flexRow alignItemsCenter'}
      border
      value={!geoCountryRegionCode ? undefined : geoCountryRegionCode}
      data={keywords ? searchResultCountry : country}
      openSearch
      showItemTitle
      isAppendToBody
      renderTitle={() => <span title={currentCountry.text}>{currentCountry.text}</span>}
      onSearch={handleSearch}
      onChange={onChangRegionCode}
      noData={keywords && _.isEmpty(searchResultCountry) ? _l('暂无搜索结果') : _l('无数据')}
      loading={loading}
      placeholder={_l('请选择')}
      onVisibleChange={visible => {
        onVisibleChange(visible);
      }}
    />
  );
}
