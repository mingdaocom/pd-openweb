import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import cx from 'classnames';
import { ScrollView, Switch, LoadDiv } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import ajaxRequest from 'src/api/appManagement';
import _ from 'lodash';
import './index.less';
import './iconfont/iconly.css';

const SYSTEM_TYLE = [
  {
    label: _l('常用'),
    key: 'general',
  },
  {
    label: _l('办公'),
    key: 'office',
  },
  {
    label: _l('财务'),
    key: 'finance',
  },
  {
    label: _l('物体'),
    key: 'object',
  },
  {
    label: _l('人物'),
    key: 'character',
  },
  {
    label: _l('符号'),
    key: 'symbol',
  },
  {
    label: _l('自然'),
    key: 'nature',
  },
  {
    label: _l('服饰'),
    key: 'costume',
  },
  {
    label: _l('饮食'),
    key: 'biteAndSup',
  },
  {
    label: _l('活动'),
    key: 'activity',
  },
  {
    label: _l('交通'),
    key: 'traffic',
  },
  {
    label: _l('地点'),
    key: 'place',
  },
];

const scrollCurrentIcon = () => {
  let currentEle = document.querySelector('.iconsScrollViewWrap .isCurrentIcon');
  if (!currentEle) return;

  let _scrollTop = currentEle.offsetTop;
  document.querySelector('.iconsScrollViewWrap .nano-content').scrollTo({
    top: _scrollTop,
    behavior: 'instant',
  });
};

function IconTabs(props) {
  const { iconColor, hideCustom, icon, projectId, handleClick } = props;

  const [loading, setLoading] = useState(true);
  const [typePage, setTypePage] = useState(0);
  const [setting, setSetting] = useState({
    isLine: icon.startsWith('sys_') ? icon.endsWith('_line') : false,
    currentKey: 'general',
    tab: !icon.startsWith('sys_') && icon.length > 29 ? 1 : 0, // 0图标 1自定义
    firstLoad: true,
    changeScrollTop: '0',
  });
  const [data, setData] = useState({
    systemIconLine: {},
    systemIcon: {},
    customIcon: [],
  });

  useEffect(() => {
    getIcon();
  }, [setting.isLine, setting.tab]);

  useEffect(() => {
    if (loading) return;
    if (!setting.firstLoad) {
      setting.tab===0 && document.querySelector('.iconsScrollViewWrap .nano-content').scrollTo({
        top: setting.changeScrollTop,
        behavior: 'instant',
      })
      return;
    }
    setSetting({
      ...setting,
      firstLoad: false,
    });
    scrollCurrentIcon();
  }, [loading]);


  const getIcon = () => {
    const { systemIconLine, systemIcon, customIcon } = data;
    const { isLine, tab } = setting;

    let currentIconTab = !icon.startsWith('sys_') && icon.length > 29 ? 1 : 0;
    if (
      (tab === 1 && customIcon.length > 0) ||
      (tab === 0 && isLine && Object.keys(systemIconLine).length > 0) ||
      (tab === 0 && !isLine && Object.keys(systemIcon).length > 0)
    ) {
      return;
    }

    !loading && setLoading(true);

    let param = {
      projectId,
      iconType: tab === 0,
    };

    if (tab === 0) {
      param.isLine = isLine;
    }

    ajaxRequest.getIcon(param).then(res => {
      let field = tab === 1 ? 'customIcon' : isLine ? 'systemIconLine' : 'systemIcon';
      setData({
        ...data,
        [field]: res,
      });
      setLoading(false);
    });
  };

  const getSystemTypeScrollTop = () => {
    SYSTEM_TYLE.forEach((item, index) => {
      SYSTEM_TYLE[index].offsetTop = document.getElementById(item.key).offsetTop;
    });
  };

  const onScroll = _.debounce((e) => {
    const scrollCon = document.querySelector('.iconsScrollViewWrap .nano-content');

    if (!SYSTEM_TYLE[0].hasOwnProperty('offsetTop')) {
      getSystemTypeScrollTop();
    }

    let _currentKey = 'general';
    let index = 0;

    SYSTEM_TYLE.forEach((item, i) => {
      if (scrollCon.scrollTop >= item.offsetTop - 97) {
        _currentKey = item.key;
        index = i;
      }
    });

    let _currentTypePage = Math.floor(index / 8);
    _currentTypePage !== typePage && setTypePage(_currentTypePage);

    setSetting({
      ...setting,
      currentKey: _currentKey,
    });
  }, 500);

  const scrollToType = item => {
    setSetting({
      ...setting,
      currentKey: item.key,
    });
    let scrollTop = document.getElementById(item.key).offsetTop;
    document.querySelector('.iconsScrollViewWrap .nano-content').scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  };

  const renderSystemIcon = () => {
    const { isLine, currentKey } = setting;

    let listData = isLine ? data.systemIconLine : data.systemIcon;

    if (loading) return <LoadDiv className="mTop10" />;

    if (Object.keys(listData).length === 0) return;

    return (
      <React.Fragment>
        <ScrollView className="iconsScrollViewWrap" scrollEvent={onScroll} disableParentScroll>
          <div className="systemIcon">
            {SYSTEM_TYLE.map((item, index) => {

              return (
                <React.Fragment key={`systemIconType-${item.key}`}>
                  {index !== 0 && (
                    <p id={item.key} className="iconType">
                      {item.label}
                    </p>
                  )}
                  <ul className="iconsWrap" id={index === 0 ? SYSTEM_TYLE[0].key : ''}>
                    {listData[item.key].map(({ fileName, iconUrl }) => {
                      let isCurrent = icon.startsWith('sys_')
                      ? icon === fileName
                      : fileName.replace('sys_', '').replace('_line', '') === icon;
                      return (
                        <li
                          key={fileName}
                          className={cx({ isCurrentIcon: isCurrent })}
                          style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                          onClick={() => handleClick({ icon: fileName, iconUrl })}
                        >
                          <span className={fileName} style={{
                            color: isCurrent ? '#fff' : '#9e9e9e',
                          }}></span>
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              );
            })}
          </div>
        </ScrollView>
        <div className="iconTypeList">
          {typePage !== 0 && (
            <div
              className="preButton"
              onClick={() => {
                setTypePage(0);
              }}
            >
              <i className="icon-next-02 font10 Gray_9d"></i>
            </div>
          )}
          <div className="iconTypeCon">
            <ul
              style={{
                transform: `translateX(${typePage * -352}px)`,
              }}
            >
              {SYSTEM_TYLE.map(item => {
                return (
                  <li
                    className={cx({ current: item.key === currentKey })}
                    key={`iconTypeNavList${item.key}`}
                    onClick={() => scrollToType(item)}
                  >
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </div>
          {typePage !== 1 && (
            <div
              className="nextButton"
              onClick={() => {
                setTypePage(1);
              }}
            >
              <i className="icon-next-02 font10 Gray_9d"></i>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  const renderCustomIcon = () => {
    if (hideCustom) return null;

    return (
      <ScrollView className="iconsScrollViewWrap">
        <div className="customIcon">
          {/* <div className="title">{_l('自定义图标')}</div> */}
          <ul className="iconsWrap">
            {data.customIcon.map(({ iconUrl, fileName }) => {
              let isCurrent = icon === fileName;
              return (
                <li
                  key={fileName}
                  className={cx({ isCurrentIcon: isCurrent })}
                  style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                  onClick={() => handleClick({ icon: fileName, iconUrl })}
                >
                  <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                </li>
              );
            })}
          </ul>
        </div>
      </ScrollView>
    );
  };

  return (
    <div className="iconTabs">
      <div className="navCon">
        <div className="navTabs">
          <span
            className={cx('navTab', { active: setting.tab === 0 })}
            onClick={() => setting.tab !== 0 && setSetting({ ...setting, tab: 0 })}
          >
            {_l('图标')}
          </span>
          {!hideCustom && (
            <span
              className={cx('navTab', { active: setting.tab === 1 })}
              onClick={() => setting.tab !== 1 && setSetting({ ...setting, tab: 1 })}
            >
              {_l('自定义')}
            </span>
          )}
        </div>

        {setting.tab === 0 && (
          <div className="switchCon">
            <Switch
              primaryColor="#2196f3"
              checked={setting.isLine}
              onClick={value => {
                let param = {
                  ...setting,
                  isLine: !value,
                  changeScrollTop: document.querySelector('.iconsScrollViewWrap .nano-content').scrollTop,
                };
                setSetting(param);

                let _endWiths = value ? '' : '_line';
                let iconName = icon.replace(/(_line)|(_fill)$/, '') + _endWiths;
                if (!icon.startsWith('sys_')) iconName = 'sys_'+iconName;
                handleClick({
                  icon: iconName,
                  iconUrl: `${md.global.FileStoreConfig.pubHost}/customIcon/${iconName}.svg`,
                  closeTrigger: false,
                });
              }}
              text={setting.isLine ? _l('线框') : _l('填充')}
            />
          </div>
        )}
      </div>
      <div className="contentCon">{setting.tab === 0 ? renderSystemIcon() : renderCustomIcon()}</div>
    </div>
  );
}

export default memo(IconTabs);
