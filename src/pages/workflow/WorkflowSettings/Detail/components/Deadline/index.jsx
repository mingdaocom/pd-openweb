import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import Time from 'ming-ui/components/NewTimePicker';
import { TIME_TYPE, TIME_TYPE_NAME } from '../../../enum';
import SpecificFieldsValue from '../SpecificFieldsValue';

export default ({ projectId, processId, relationId, selectNodeId, data, text, minDate, onChange }) => {
  const UNIT_List = [
    { text: TIME_TYPE_NAME[TIME_TYPE.MINUTE], value: TIME_TYPE.MINUTE },
    { text: TIME_TYPE_NAME[TIME_TYPE.HOUR], value: TIME_TYPE.HOUR },
    { text: TIME_TYPE_NAME[TIME_TYPE.DAY], value: TIME_TYPE.DAY },
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
      <Dropdown
        className="mLeft10"
        style={{ width: 100 }}
        data={UNIT_List}
        value={data.unit}
        border
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
          <div className="mLeft10" style={{ width: 100 }}>
            <Time
              type="minute"
              value={{
                hour: data.dayTime ? parseInt(data.dayTime.split(':')[0]) : 8,
                minute: data.dayTime ? parseInt(data.dayTime.split(':')[1]) : 0,
                second: 0,
              }}
              onChange={(event, value) => {
                onChange(
                  Object.assign({}, data, {
                    dayTime: value.hour.toString().padStart(2, '0') + ':' + value.minute.toString().padStart(2, '0'),
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
