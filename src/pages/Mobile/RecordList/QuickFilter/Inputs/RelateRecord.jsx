import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { arrayOf, func, shape, string } from 'prop-types';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import RelateRecordOptions from './RelateRecordOptions';
import RelateRecordList from './RelateRecordList';
import RightSidebar from './RightSidebar';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';

export default function RelateRecord(props) {
  const { values = [], control, advancedSetting, onChange = () => {} } = props;
  const { enumDefault, relationControls = [], controlId } = control;
  const { showtype, allowlink, ddset, allowitem, direction } = advancedSetting;
  const isMultiple = String(allowitem) === '2';
  const [moreVisible, setMoreVisible] = useState(false);

  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  }

  function handleChange(value) {
    onChange({
      filterType: 24,
      ...value,
    });
  }

  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {!_.isEmpty(values) && (
          <div className="selected ellipsis">{isMultiple ? _l('选择%0项', values.length) : getTitleTextFromControls(control.relationControls, values[0]) }</div>
        )}
      </div>
      <RelateRecordOptions
        multiple={isMultiple}
        selected={values}
        control={control}
        onSetMoreVisible={handleSetMoreVisible}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
      {moreVisible && (
        <RightSidebar
          name={control.controlName}
          onHideSidebar={handleSetMoreVisible}
        >
          <RelateRecordList
            multiple={isMultiple}
            selected={values}
            control={control}
            onChange={newRecords => {
              handleChange({ values: newRecords });
            }}
          />
        </RightSidebar>
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
