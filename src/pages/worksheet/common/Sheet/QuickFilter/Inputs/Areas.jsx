import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { CityPicker } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';

export default function Areas(props) {
  const { values = [], control = {}, isMultiple, onChange = () => {}, projectId } = props;
  const [search, setSearch] = useState(undefined);
  const [keywords, setKeywords] = useState('');
  const [defaultValue, setDefaultValue] = useState(null);
  const tempArea = useRef();
  const { enumDefault2, advancedSetting: { chooserange = 'CN', commcountries } = {} } = control;

  const onFetchData = useMemo(() => _.debounce(value => setKeywords(value), 500), []);
  const options = values.map(value => ({ label: value.name, value: value.id }));
  const selectedValue = isMultiple ? values.map(value => value.id) : values[0]?.id;

  useEffect(() => () => onFetchData.cancel(), [onFetchData]);

  const clearSearch = () => {
    if (!search) return;
    setSearch(isMultiple ? '' : undefined);
    setKeywords('');
  };

  return (
    <CityPicker
      className="w100 InlineBlock"
      search={keywords}
      destroyPopupOnHide
      defaultValue={defaultValue}
      chooserange={chooserange}
      commcountries={commcountries}
      level={enumDefault2}
      projectId={projectId}
      callback={area => {
        const last = _.last(area);

        if (last) {
          tempArea.current = {
            name: last.path,
            id: last.id,
          };
        }

        clearSearch();
      }}
      handleClose={() => {
        setDefaultValue(null);
        if (tempArea.current) {
          onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
        }

        clearSearch();
      }}
    >
      <Select
        className="w100"
        mode={isMultiple ? 'multiple' : undefined}
        open={false}
        showSearch
        autoClearSearchValue={false}
        filterOption={false}
        allowClear
        options={options}
        value={selectedValue}
        searchValue={search || ''}
        onSearch={value => {
          setSearch(value);
          onFetchData(value);
        }}
        onClear={() => {
          onChange({ values: [] });
          tempArea.current = undefined;
          setDefaultValue('');
          if (search) {
            setSearch('');
            setKeywords('');
          }
        }}
        onDeselect={id => onChange({ values: values.filter(value => value.id !== id) })}
      />
    </CityPicker>
  );
}

Areas.propTypes = {
  control: shape({}),
  isMultiple: bool,
  projectId: string,
  values: arrayOf(
    shape({
      id: string,
      name: string,
    }),
  ),
  onChange: func,
};
