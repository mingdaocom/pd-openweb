import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import fixedDataAjax from 'src/api/fixedData';

export default function RegionDropdown(props) {
  const { onChange, onVisibleChange } = props;
  const searchSeqRef = useRef(0);
  const [{ loading, geoCountryRegionCode, country, keywords, debouncedKeywords, searchResultCountry }, setState] =
    useSetState({
      geoCountryRegionCode: props.geoCountryRegionCode,
      country: [],
      searchResultCountry: [],
      keywords: '',
      debouncedKeywords: '',
      loading: false,
    });
  const loadCountries = useCallback(
    searchKeywords => {
      const isSearch = !!searchKeywords;
      const searchSeq = isSearch ? searchSeqRef.current + 1 : searchSeqRef.current;

      if (isSearch) {
        searchSeqRef.current = searchSeq;
      }

      setState({ loading: true });
      fixedDataAjax
        .getCitysByParentID({
          langType: window.getCurrentLangCode(),
          layer: 0,
          keywords: searchKeywords,
        })
        .then(res => {
          if (isSearch && searchSeq !== searchSeqRef.current) {
            return;
          }

          const countryData = _.get(res, 'citys', []).map(l => ({ ...l, label: l.name, value: l.id }));

          if (searchKeywords) {
            setState({ searchResultCountry: countryData, loading: false });
          } else {
            setState({ country: countryData, loading: false });
          }
        })
        .catch(error => {
          if (isSearch && searchSeq !== searchSeqRef.current) {
            return;
          }

          console.error('Search failed:', error);
          setState({ loading: false });
        });
    },
    [setState],
  );
  const searchCountry = useMemo(
    () =>
      _.debounce(searchKeywords => {
        setState({ debouncedKeywords: searchKeywords });
      }, 500),
    [setState],
  );

  useEffect(() => {
    loadCountries('');
    return () => {
      searchSeqRef.current += 1;
      searchCountry.cancel();
    };
  }, [loadCountries, searchCountry]);

  useEffect(() => {
    if (debouncedKeywords) {
      loadCountries(debouncedKeywords);
    }
  }, [debouncedKeywords, loadCountries]);

  const onChangRegionCode = code => {
    setState({ geoCountryRegionCode: code });
    onChange(code);
  };

  const handleSearch = newKeywords => {
    const nextKeywords = (newKeywords || '').trim();

    setState({ keywords: nextKeywords });

    if (!nextKeywords) {
      searchSeqRef.current += 1;
      searchCountry.cancel();
      setState({ debouncedKeywords: '', searchResultCountry: [], loading: false });
      return;
    }

    searchCountry(nextKeywords);
  };

  const currentCountry = _.find(country, v => v.id === geoCountryRegionCode) || {};

  return (
    <Select
      className={'w100 controlDropdown flexRow alignItemsCenter'}
      value={!geoCountryRegionCode ? undefined : geoCountryRegionCode}
      options={keywords ? searchResultCountry : country}
      showPopupSearch
      optionFilterProp="label"
      labelRender={() => <span title={currentCountry.label}>{currentCountry.label}</span>}
      onSearch={handleSearch}
      onChange={onChangRegionCode}
      notFoundContent={keywords && _.isEmpty(searchResultCountry) ? _l('暂无搜索结果') : _l('无数据')}
      loading={loading}
      placeholder={_l('请选择')}
      onOpenChange={visible => {
        onVisibleChange(visible);
      }}
    />
  );
}
