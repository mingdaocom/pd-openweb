import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import fixedDataApi from 'src/api/fixedData';
import homeAppApi from 'src/api/homeApp';

export default function AppTimeZone(props) {
  const { appId, data = {}, onChangeData } = props;
  const [timeZones, setTimeZones] = useState([]);
  const [currentTimeZone, setCurrentTimeZone] = useState(
    !_.isUndefined(data.timeZone) ? data.timeZone : md.global.Config.DefaultTimeZone,
  );

  useEffect(() => {
    fixedDataApi.loadTimeZones().then(res => {
      if (res) {
        const data = Object.keys(res)
          .map(key => ({ label: res[key], value: parseInt(key) }))
          .sort((a, b) => a.value - b.value);

        setTimeZones(data);
      }
    });
  }, []);

  const selectedTimeZone = timeZones.some(item => item.value === currentTimeZone) ? currentTimeZone : undefined;

  const onChangeTimeZone = timeZone => {
    homeAppApi.editAppTimeZones({ appId, timeZone }).then(res => {
      if (res) {
        setCurrentTimeZone(timeZone);
        onChangeData({ timeZone });
        window[`timeZone_${appId}`] = timeZone;
        alert(_l('设置成功'));
      } else {
        alert(_l('设置失败'), 2);
      }
    });
  };

  return (
    <div>
      <div className="Font17 bold">{_l('应用时区')}</div>
      <div className="mTop8 textTertiary">
        {_l('应用时区是整个应用中使用的统一时间标准，确保所有团队成员在数据筛选、统计时看到一致的时间信息')}
      </div>
      <div className="flexRow alignItemsCenter mTop32">
        <div className="Width120">{_l('时区')}</div>
        <Select
          showPopupSearch
          optionFilterProp="label"
          value={selectedTimeZone}
          options={timeZones}
          styles={{ root: { width: 500 } }}
          onChange={onChangeTimeZone}
        />
      </div>
    </div>
  );
}
