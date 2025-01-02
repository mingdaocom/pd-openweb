import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import fixedDataApi from 'src/api/fixedData';
import homeAppApi from 'src/api/homeApp';
import _ from 'lodash';

const AppTimeZoneDropdown = styled(Dropdown)`
  width: 500px;
  color: #151515;
  .Dropdown--border {
    height: 32px;
  }
  .ming.Menu {
    width: auto;
    right: 0;
  }
`;

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
          .map(key => ({ text: res[key], value: parseInt(key) }))
          .sort((a, b) => a.value - b.value);

        setTimeZones(data);
      }
    });
  }, []);

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
      <div className="mTop8 Gray_9e">
        {_l('应用时区是整个应用中使用的统一时间标准，确保所有团队成员在数据筛选、统计时看到一致的时间信息')}
      </div>
      <div className="flexRow alignItemsCenter mTop32">
        <div className="Width120">{_l('时区')}</div>
        <AppTimeZoneDropdown border openSearch value={currentTimeZone} data={timeZones} onChange={onChangeTimeZone} />
      </div>
    </div>
  );
}
