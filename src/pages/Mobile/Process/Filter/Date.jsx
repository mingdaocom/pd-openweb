import React, { useState } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #f5f5f5;
`;

export default props => {
  const { date = {}, onChange } = props;
  const { startDate, endDate } = date;
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  return (
    <div className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('时间')}</div>
      <div className="flexRow">
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            value={startDate || ''}
            placeholder={_l('开始日期')}
            onClick={() => setStartDateVisible(true)}
          />
          {startDateVisible && (
            <MobileDatePicker
              customHeader={_l('开始日期')}
              showType="date"
              precision="date"
              isOpen={startDateVisible}
              value={startDate || new Date()}
              onClose={() => setStartDateVisible(false)}
              onCancel={() => onChange({ startDate: '' })}
              onSelect={date => {
                const value = moment(date).format('YYYY-MM-DD');
                onChange({ startDate: value, endDate: '' });
                setStartDateVisible(false);
              }}
              max={new Date()}
            />
          )}
        </div>
        <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            value={endDate || ''}
            placeholder={_l('结束日期')}
            onClick={() => setEndDateVisible(true)}
          />
          {endDateVisible && (
            <MobileDatePicker
              customHeader={_l('结束日期')}
              showType="date"
              precision="date"
              isOpen={endDateVisible}
              value={endDate || new Date()}
              onClose={() => setEndDateVisible(false)}
              onCancel={() => onChange({ endDate: '' })}
              onSelect={date => {
                const value = moment(date).format('YYYY-MM-DD');
                onChange({ startDate, endDate: value });
                setEndDateVisible(false);
              }}
              min={startDate ? moment(startDate).toDate() : undefined}
              max={new Date()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
