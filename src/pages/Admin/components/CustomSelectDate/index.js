import React, { useState, useRef, useEffect } from 'react';
import { Icon, DatePicker } from 'ming-ui';
import { Select } from 'antd';
import { seachdateList } from '../../logs/enum';
import moment from 'moment';
import './index.less';

export default function CustomSelectDate(props) {
  const { changeDate = () => {}, className, placeholder } = props;
  const [openDateSelect, setOpenDateSelect] = useState(false);
  const [dateInfo, setDateInfo] = useState({});
  const $ref = useRef();
  const dateFormat = props.dateFormat ? props.dateFormat : 'YYYY-MM-DD';

  const changeFileds = item => {
    let startDate = moment().subtract(29, 'days').startOf('day').format(dateFormat),
      endDate = moment().endOf('day').format(dateFormat);
    switch (item.value) {
      case 0:
        startDate = moment().startOf('day').format(dateFormat);
        break;
      case 1:
        startDate = moment().subtract(1, 'days').startOf('day').format(dateFormat);
        endDate = moment().subtract(1, 'days').endOf('day').format(dateFormat);

        break;
      case 2:
        startDate = moment().startOf('week').format(dateFormat);
        endDate = moment().endOf('week').format(dateFormat);
        break;
      case 3:
        startDate = moment().subtract(1, 'week').startOf('week').format(dateFormat);
        endDate = moment().subtract(1, 'week').endOf('week').format(dateFormat);
        break;
      case 4:
        startDate = moment().startOf('months').format(dateFormat);
        endDate = moment().endOf('months').format(dateFormat);
        break;
      case 5:
        startDate = moment().subtract(1, 'months').startOf('months').format(dateFormat);
        endDate = moment().subtract(1, 'months').endOf('months').format(dateFormat);
        break;
      case 6:
        startDate = moment().subtract(6, 'days').startOf('day').format(dateFormat);
        break;
      case 7:
        startDate = moment().subtract(29, 'days').startOf('day').format(dateFormat);
        break;
      case 8:
        startDate = moment().subtract(6, 'months').startOf('day').format(dateFormat);
        break;
    }
    changeDate({ startDate, endDate, searchDateStr: item.label });
    setDateInfo({ searchDateStr: item.label, startDate, endDate });
  };

  useEffect(() => {
    setDateInfo(props.dateInfo);
  }, [props.dateInfo]);

  return (
    <div className="w100 Relative">
      <Select
        suffixIcon={<Icon icon="sidebar_calendar" className="Font16" />}
        dropdownClassName="serchDate"
        dropdownStyle={!openDateSelect ? { display: 'none' } : {}}
        className={className}
        placeholder={placeholder || _l('最近30天')}
        onChange={value => {
          changeDate({ startDate: undefined, endDate: undefined, searchDateStr: undefined });
          setDateInfo({ searchDateStr: undefined, startDate: undefined, endDate: undefined });
        }}
        value={dateInfo.searchDateStr}
        allowClear
        onDropdownVisibleChange={open => {
          setOpenDateSelect(open);
        }}
        dropdownRender={() => (
          <div className="listContainer">
            {(seachdateList || []).map(item => (
              <div
                className="listItem"
                key={item.value}
                value={item.value}
                onClick={() => {
                  changeFileds(item);
                  setOpenDateSelect(false);
                }}
              >
                {item.label}
              </div>
            ))}
            <div ref={$ref} className="listItem">
              <DatePicker.RangePicker
                offset={{ top: 0, left: -24 }}
                popupParentNode={() => $ref.current}
                min={md.global.Config.IsLocal ? undefined : moment().subtract(6, 'months')}
                onOk={([start, end]) => {
                  const searchDateStr = `${start.format(dateFormat)}~${end.format(dateFormat)} `;
                  setOpenDateSelect(false);
                  changeDate({ startDate: start.format(dateFormat), endDate: end.format(dateFormat), searchDateStr });
                  setDateInfo({ searchDateStr, startDate: start.format(dateFormat), endDate: end.format(dateFormat) });
                }}
                onClear={() => {
                  setDateInfo({ searchDateStr: undefined, startDate: undefined, endDate: undefined });
                }}
              >
                <li>{_l('自定义日期')}</li>
              </DatePicker.RangePicker>
            </div>
          </div>
        )}
      ></Select>
    </div>
  );
}
