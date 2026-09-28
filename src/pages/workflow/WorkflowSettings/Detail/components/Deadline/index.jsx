import React, { Fragment } from 'react';
import moment from 'moment';
import { Select, TimePicker } from 'ming-ui/antd-components';
import { TIME_TYPE, TIME_TYPE_NAME } from '../../../enum';
import SpecificFieldsValue from '../SpecificFieldsValue';

export default ({ projectId, processId, relationId, selectNodeId, data, text, minDate, onChange }) => {
  const UNIT_List = [
    { label: TIME_TYPE_NAME[TIME_TYPE.MINUTE], value: TIME_TYPE.MINUTE },
    { label: TIME_TYPE_NAME[TIME_TYPE.HOUR], value: TIME_TYPE.HOUR },
    { label: TIME_TYPE_NAME[TIME_TYPE.DAY], value: TIME_TYPE.DAY },
  ];

  return data.type === 1 ? (
    <div className="flexRow alignItemsCenter mTop10">
      {text && <div className="mRight10">{text}</div>}
      <div className="flex">
        <SpecificFieldsValue
          projectId={projectId}
          processId={processId}
          relationId={relationId}
          selectNodeId={selectNodeId}
          type="number"
          min={1}
          allowedEmpty
          data={data.executeTime}
          updateSource={executeTime => onChange(Object.assign({}, data, { executeTime }))}
        />
      </div>
      <Select
        className="mLeft10"
        style={{ width: 100 }}
        options={UNIT_List}
        value={data.unit}
        onChange={unit => {
          onChange(Object.assign({}, data, { unit }));
        }}
      />
    </div>
  ) : (
    <div className="flexRow alignItemsCenter mTop10">
      <div className="flex">
        <SpecificFieldsValue
          projectId={projectId}
          processId={processId}
          relationId={relationId}
          selectNodeId={selectNodeId}
          type="date"
          timePicker
          minDate={minDate}
          data={data.executeTime}
          updateSource={executeTime =>
            onChange(
              Object.assign({}, data, {
                executeTime,
                dayTime: executeTime.fieldControlType === 15 ? '08:00' : '',
              }),
            )
          }
        />
      </div>
      {data.executeTime && !!data.executeTime.fieldControlType && data.executeTime.fieldControlType === 15 && (
        <Fragment>
          <div className="mLeft10">{_l('的')}</div>
          <div className="mLeft10">
            <TimePicker
              allowClear={false}
              format="HH:mm"
              inputReadOnly
              showNow={false}
              value={moment(data.dayTime || '08:00', 'HH:mm')}
              onChange={(time, timeString) => {
                onChange(
                  Object.assign({}, data, {
                    dayTime: timeString,
                  }),
                );
              }}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
};
