import React, { useState } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape } from 'prop-types';
import MobileRecordCardListDialog from 'mobile/components/RecordCardListDialog';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import RelateRecordOptions from './RelateRecordOptions';

export default function RelateRecord(props) {
  const { values = [], advancedSetting, onChange = () => {}, appId, worksheetId, filtersData } = props;
  const controlAdvancedSetting = _.get(props, 'control.advancedSetting') || {};
  const control = _.assign({}, props.control, {
    advancedSetting: {
      searchcontrol: controlAdvancedSetting.searchcontrol,
      scanlink: controlAdvancedSetting.scanlink,
      scancontrol: controlAdvancedSetting.scancontrol,
    },
  });
  const { controlId, coverCid, showControls, dataSource, viewId } = control;
  const { allowitem, nullitemname, shownullitem, navshow, navfilters } = advancedSetting;
  const isMultiple = String(allowitem) === '2';
  const [moreVisible, setMoreVisible] = useState(false);
  let staticRecords;
  if (navshow === '3') {
    control.advancedSetting.filters = navfilters;
  }
  if (navshow === '2') {
    staticRecords = JSON.parse(navfilters)
      .map(safeParse)
      .map(r => ({ rowid: r.id, ...r }));
  }
  const prefixRecords =
    shownullitem === '1'
      ? [
          {
            rowid: 'isEmpty',
            name: nullitemname || _l('为空'),
          },
        ]
      : [];
  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  };

  function handleChange(value) {
    onChange({
      ...value,
    });
  }
  const getDefaultRelateSheetValue = () => {
    try {
      const { formData, controlId, recordId, worksheetId } = this.props.control;
      const titleControl = _.find(formData, control => control.attribute === 1);
      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: recordId,
        }),
      };
      if (titleControl.type === 29) {
        try {
          const cellData = JSON.parse(titleControl.value);
          defaultRelatedSheetValue.name = cellData[0].name;
        } catch (err) {
          console.log(err);
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      console.log(err);
      return;
    }
  };

  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis controlName">{control.controlName}</div>
        {!_.isEmpty(values) && (
          <div className="selected ellipsis">
            {isMultiple
              ? _l('选择%0项', values.length)
              : values[0].rowid === 'isEmpty'
                ? values[0].name
                : _.get(values[0], 'name') || getTitleTextFromControls(control.relationControls, values[0])}
          </div>
        )}
      </div>
      <RelateRecordOptions
        multiple={isMultiple}
        selected={values}
        formData={filtersData}
        control={control}
        advancedSetting={advancedSetting}
        prefixRecords={prefixRecords}
        staticRecords={staticRecords}
        parentWorksheetId={worksheetId}
        onSetMoreVisible={handleSetMoreVisible}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
      {moreVisible && (
        <MobileRecordCardListDialog
          getFilterRowsGetType={32}
          maxCount={50}
          selectedCount={values.length}
          from={5}
          control={control}
          allowNewRecord={false}
          multiple={isMultiple}
          coverCid={coverCid}
          filterRowIds={[]}
          showControls={showControls}
          appId={appId}
          viewId={viewId}
          relateSheetId={dataSource}
          parentWorksheetId={worksheetId}
          filterRelatesheetControlIds={[controlId]}
          staticRecords={staticRecords}
          defaultRelatedSheet={getDefaultRelateSheetValue()}
          controlId={controlId}
          visible={moreVisible}
          onClose={() => setMoreVisible(false)}
          onOk={newRecords => {
            let selectedValue = values.map(item => item.rowid);
            let result = newRecords.filter(item => !_.includes(selectedValue, item.rowid)).concat(values);
            handleChange({ values: isMultiple ? result : newRecords });
          }}
          formData={filtersData}
          fastSearchControlArgs={
            advancedSetting.searchcontrol
              ? {
                  controlId: advancedSetting.searchcontrol,
                  filterType: advancedSetting.searchtype === '1' ? 2 : 1,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
