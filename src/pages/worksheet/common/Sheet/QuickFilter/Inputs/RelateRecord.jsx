import React from 'react';
import _, { find } from 'lodash';
import { arrayOf, func, shape } from 'prop-types';
import styled from 'styled-components';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import RelateRecordOptions from './RelateRecordOptions';

const Con = styled.div`
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
  .RelateRecordDropdown {
    width: 100%;
  }
`;

const SELECT_PROPS = {
  hideRemoveIconOnBlur: false,
  styles: {
    item: {
      '--hap-select-multi-item-background': 'var(--color-primary-transparent)',
    },
  },
};

export default function RelateRecord(props) {
  const { worksheetId, values = [], filtersData, advancedSetting, onChange = () => {}, appId } = props;
  const controlAdvancedSetting = _.get(props, 'control.advancedSetting') || {};
  const control = _.assign({}, props.control, {
    advancedSetting: {
      searchcontrol: controlAdvancedSetting.searchcontrol,
    },
  });
  const { relationControls = [] } = control;
  const { navshow, allowitem, navfilters, direction, shownullitem, nullitemname } = advancedSetting || {};
  let staticRecords;

  if (navshow === '3') {
    control.advancedSetting.filters = navfilters;
  } else if (navshow === '2') {
    staticRecords = JSON.parse(navfilters)
      .map(safeParse)
      .map(r => ({ rowid: r.id, ...r }));
  }

  let fastSearchControlArgs;

  if (advancedSetting.searchcontrol) {
    control.advancedSetting.searchcontrol = advancedSetting.searchcontrol;
    fastSearchControlArgs = {
      controlId: advancedSetting.searchcontrol,
      filterType: advancedSetting.searchtype === '1' ? 2 : 1,
    };
  }

  if (advancedSetting.clicksearch && navshow !== '2') {
    control.advancedSetting.clicksearch = advancedSetting.clicksearch;
  }

  const isRelateTable = isRelateRecordTableControl(props.control);
  const isMultiple = String(allowitem) === '2';
  const prefixRecords =
    shownullitem === '1'
      ? [
          {
            rowid: 'isEmpty',
            name: nullitemname || _l('为空'),
          },
        ]
      : [];

  function handleChange(value) {
    onChange({
      ...value,
    });
  }

  if (String(direction) === '1') {
    return (
      <RelateRecordOptions
        advancedSetting={advancedSetting}
        multiple={isMultiple}
        selected={values}
        formData={filtersData}
        control={control}
        parentWorksheetId={worksheetId}
        parentAppId={appId}
        prefixRecords={prefixRecords}
        staticRecords={
          staticRecords
            ? staticRecords.concat(
                values.filter(item => !find(staticRecords, r => r.rowid === item.rowid) && item.rowid !== 'isEmpty'),
              )
            : []
        }
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
    );
  }

  // searchcontrol
  // searchtype 0 模糊[default] 1精确
  // clicksearch 1 搜索后限制 0[default]
  return (
    <Con>
      <RelateRecordDropdown
        getFilterRowsGetType={32}
        disableNewRecord
        doNotClearKeywordsWhenChange={isMultiple}
        parentWorksheetId={worksheetId}
        isQuickFilter
        control={control}
        {...control}
        enumDefault2={1}
        formData={filtersData}
        advancedSetting={{}}
        controls={relationControls}
        selected={values}
        showCoverAndControls={!isRelateTable}
        forceShowDialogSelect={isRelateTable || controlAdvancedSetting.openfastfilters === '1'}
        popupContainer={() => document.body}
        multiple={isMultiple}
        selectProps={SELECT_PROPS}
        prefixRecords={prefixRecords}
        staticRecords={staticRecords}
        fastSearchControlArgs={fastSearchControlArgs}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
    </Con>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
