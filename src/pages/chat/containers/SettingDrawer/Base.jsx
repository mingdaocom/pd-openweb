import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Dropdown, LoadDiv, RadioGroup } from 'ming-ui';
import fixedDataApi from 'src/api/fixedData';
import privateMapApi from 'src/api/privateMap';

const Wrap = styled.div`
  .systemSettingsDropdown {
    width: 500px;
    max-width: 600px;
    .ming.Menu {
      width: auto;
      right: 0;
    }
  }
`;

export default props => {
  const { accountSettings, handleChangeAccountSettings, handleSureSettings } = props;
  const [loading, setLoading] = useState(true);
  const [currentTimeZone, setCurrentTimeZone] = useState(md.global.Account.timeZone);
  const [map, setMap] = useState(md.global.Account.map || 0);
  const [timeZones, setTimeZones] = useState([]);
  const [mapList, setMapList] = useState([]);

  useEffect(() => {
    fixedDataApi.loadTimeZones().then(res => {
      const timeZones = [];
      Object.keys(res).forEach(key => {
        timeZones.push({ text: res[key], value: parseInt(key) });
      });
      setTimeZones(
        [{ text: _l('跟随设备时区（配置时区，依据您正在使用设备的系统时区设置）'), value: 1 }].concat(
          timeZones.sort((a, b) => a.value - b.value),
        ),
      );
      setLoading(false);
    });
    if (md.global.SysSettings.enableMap) {
      privateMapApi.getAvailableMapList({}).then(res => {
        const list = (res || []).map(item => ({
          text: item.type === 0 ? _l('高德地图') : _l('Google地图'),
          value: item.type,
        }));
        setMapList(list);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContent flex">
        <LoadDiv />
      </div>
    );
  }

  const renderCurrentTimeZone = () => {
    return (
      <Fragment>
        <div className="Font14 Gray bold">{_l('时区')}</div>
        <div className="Font13 Gray_75 mTop8 mBottom10">
          {_l('当您在应用中输入和查看时间数据时，将按照设定的个人时区转换')}
        </div>
        <Dropdown
          className="systemSettingsDropdown Gray w100"
          border
          value={currentTimeZone}
          data={timeZones}
          openSearch
          showItemTitle
          renderTitle={(selectedData = {}) => <span title={selectedData.text}>{selectedData.text}</span>}
          onChange={value => {
            handleSureSettings('timeZone', value, () => {
              setCurrentTimeZone(value);
              md.global.Account.timeZone = value;
            });
          }}
        />
      </Fragment>
    );
  };

  const renderMap = () => {
    return (
      <Fragment>
        <div className="Font14 Gray bold mTop25">{_l('地图服务')}</div>
        <div className="Font13 Gray_75 mTop8 mBottom10">{_l('设置定位字段和地图视图中使用的地图服务')}</div>
        <Dropdown
          className="systemSettingsDropdown w100 Gray"
          border
          value={map}
          data={mapList}
          onChange={value => {
            handleSureSettings('map', value, () => {
              setMap(value);
              md.global.Account.map = value;
            });
          }}
        />
        <div
          className="Gray_75 mTop10 pLeft10 pRight10 pTop5 pBottom5 boderRadAll_3"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          {map === 1
            ? _l('包含全球地图，暂不支持搜索名称定位。')
            : _l('支持搜索地点名称定位，地图信息只包含：中国大陆、香港、澳门、台湾地区')}
        </div>
      </Fragment>
    );
  };

  const renderBackHomepageWay = () => {
    return (
      <Fragment>
        <div className="Font14 Gray bold mTop25 mBottom10">{_l('应用返回首页方式')}</div>
        <RadioGroup
          size="middle"
          vertical={true}
          data={[
            {
              text: _l('点击直接返回'),
              value: 1,
            },
            {
              text: _l('悬停时先侧滑打开应用列表'),
              value: 2,
            },
          ]}
          checkedValue={accountSettings.backHomepageWay}
          onChange={value => {
            handleSureSettings('backHomepageWay', value, () => {
              window.backHomepageWay = value;
              handleChangeAccountSettings({
                backHomepageWay: value,
              });
            });
          }}
        />
      </Fragment>
    );
  };

  const renderIsOpenMessageSound = () => {
    return (
      <Fragment>
        <div className="Font14 Gray bold mTop25">{_l('浏览器消息通知')}</div>
        <div className="Font13 Gray_75 mTop8 mBottom10">{_l('设置在浏览器中，当有新消息时以何种方式提示')}</div>
        <div className="mBottom10">
          <Checkbox
            checked={accountSettings.isOpenMessageSound}
            onClick={isOpenMessageSound => {
              handleSureSettings('isOpenMessageSound', !isOpenMessageSound ? 1 : 0, () => {
                window.isOpenMessageSound = !isOpenMessageSound;
                handleChangeAccountSettings({
                  isOpenMessageSound: !isOpenMessageSound,
                });
              });
            }}
          >
            {_l('通知音')}
          </Checkbox>
        </div>
        <div>
          <Checkbox
            checked={accountSettings.isOpenMessageTwinkle}
            onClick={isOpenMessageTwinkle => {
              handleSureSettings('isOpenMessageTwinkle', !isOpenMessageTwinkle ? 1 : 0, () => {
                window.isOpenMessageTwinkle = !isOpenMessageTwinkle;
                handleChangeAccountSettings({
                  isOpenMessageTwinkle: !isOpenMessageTwinkle,
                });
              });
            }}
          >
            {_l('浏览器标签闪烁')}
          </Checkbox>
        </div>
      </Fragment>
    );
  };

  return (
    <Wrap className="flex">
      {renderCurrentTimeZone()}
      {md.global.SysSettings.enableMap && renderMap()}
      {renderBackHomepageWay()}
      {renderIsOpenMessageSound()}
    </Wrap>
  );
};
