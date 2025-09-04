import React, { memo, useEffect, useRef, useState } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView, SvgIcon, Switch } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import './iconfont/iconly.css';
import './index.less';

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

const isCustomIcon = icon => !icon.startsWith('sys_');

function IconTabs(props) {
  const { iconColor, hideCustom, icon, projectId, handleClick, navColor } = props;
  const commonData = safeParse(localStorage.getItem('md_common_icons'), 'array');
  const commonSetting = safeParse(localStorage.getItem('md_common_icon_setting'));
  const lightColor = generate(iconColor)[0];
  const light = [lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
  const black = '#1b2025' === navColor;

  const [loading, setLoading] = useState(true);
  const [typePage, setTypePage] = useState(0);
  const [setting, setSetting] = useState({
    isLine: !_.isUndefined(commonSetting.isLine)
      ? commonSetting.isLine
      : icon.startsWith('sys_')
        ? icon.endsWith('_line')
        : false,
    currentKey: 'general',
    tab: hideCustom ? 0 : !_.isUndefined(commonSetting.tab) ? commonSetting.tab : isCustomIcon(icon) ? 1 : 0, // 0图标 1自定义
    firstLoad: true,
    changeScrollTop: '0',
  });
  const [data, setData] = useState({
    systemIconLine: {},
    systemIcon: {},
    customIcon: [],
  });
  const currentIcon = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (!currentIcon.current) return;

      safeLocalStorageSetItem(
        'md_common_icons',
        JSON.stringify(
          _.uniqBy([currentIcon.current].concat(commonData), l =>
            isCustomIcon(l.icon) ? l.icon : l.icon.replace('_line', ''),
          ).splice(0, 11),
        ),
      );
    };
  }, []);

  useEffect(() => {
    getIcon();
    safeLocalStorageSetItem('md_common_icon_setting', JSON.stringify({ ..._.pick(setting, ['isLine', 'tab']) }));
  }, [setting.isLine, setting.tab]);

  useEffect(() => {
    if (loading) return;

    if (!setting.firstLoad) {
      setting.tab === 0 && scrollRef.current && scrollRef.current.scrollTo({ top: setting.changeScrollTop });
      return;
    }

    setSetting({
      ...setting,
      firstLoad: false,
    });
  }, [loading]);

  const getIcon = () => {
    const { systemIconLine, systemIcon, customIcon } = data;
    const { isLine, tab } = setting;

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

  const onScroll = _.debounce(({ scrollTop }) => {
    if (!_.has(SYSTEM_TYLE[0], 'offsetTop')) {
      getSystemTypeScrollTop();
    }

    let _currentKey = 'general';
    let index = 0;

    SYSTEM_TYLE.forEach((item, i) => {
      if (scrollTop >= item.offsetTop - 97) {
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
    scrollRef.current && scrollRef.current.scrollTo({ top: scrollTop });
  };

  const onClickIcon = param => {
    currentIcon.current = param;
    handleClick(param);
  };

  const handleSwitch = value => {
    let param = {
      ...setting,
      isLine: !value,
      changeScrollTop: scrollRef.current ? scrollRef.current.getScrollInfo().scrollTop : setting.scrollTop,
    };
    setSetting(param);

    if (isCustomIcon(icon)) return;

    const iconName = getIconName(icon, !value);
    onClickIcon({
      icon: iconName,
      iconUrl: `${md.global.FileStoreConfig.pubHost}/customIcon/${iconName}.svg`,
      closeTrigger: false,
    });
  };

  const getIconName = (l, isLine) => {
    const isCustom = isCustomIcon(l);
    const name = isCustom || l.startsWith('sys_') ? l : 'sys_' + l;

    if (isCustom || (isLine && l.endsWith('_line'))) return name;

    if (isLine) return name + '_line';

    return name.replace('_line', '');
  };

  const renderCommonIcon = () => {
    if (!commonData.length) return;
    return (
      <div className="commonIcon">
        <p className="iconType">{_l('最近使用')}</p>
        <ul className="iconsWrap">
          {commonData.map(l => {
            const isCustom = isCustomIcon(l.icon);
            const iconItem = getIconName(l.icon, setting.isLine);
            const isCurrent = iconItem === icon;
            const backgroundColor = isCurrent ? (light ? lightColor : navColor || iconColor) : '#fff';
            const fillColor = isCurrent ? (black || light ? iconColor : '#fff') : '#9e9e9e';

            return (
              <li
                key={`common-icons-${l.icon}`}
                className={cx({ isCurrentIcon: isCurrent })}
                style={{ backgroundColor }}
                onClick={() => {
                  onClickIcon({
                    icon: iconItem,
                    iconUrl: isCustom ? l.iconUrl : l.iconUrl.replace(l.icon, iconItem),
                  });
                }}
              >
                {isCustom ? (
                  <SvgIcon url={l.iconUrl} fill={fillColor} />
                ) : (
                  <span
                    className={iconItem}
                    style={{
                      color: fillColor,
                    }}
                  ></span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderSystemIcon = () => {
    const { isLine, currentKey } = setting;

    let listData = isLine ? data.systemIconLine : data.systemIcon;

    if (loading) return <LoadDiv className="mTop10" />;

    if (Object.keys(listData).length === 0) return;

    return (
      <React.Fragment>
        <ScrollView ref={scrollRef} className="iconsScrollViewWrap" onScroll={onScroll} disableParentScroll>
          {renderCommonIcon()}
          <div className="systemIcon">
            {SYSTEM_TYLE.map((item, index) => {
              return (
                <React.Fragment key={`systemIconType-${item.key}`}>
                  {(index !== 0 || !!commonData.length) && (
                    <p id={item.key} className="iconType">
                      {item.label}
                    </p>
                  )}
                  <ul className="iconsWrap" id={index === 0 ? SYSTEM_TYLE[0].key : ''}>
                    {listData[item.key].map(({ fileName, iconUrl }) => {
                      let isCurrent = icon.startsWith('sys_')
                        ? icon === fileName
                        : fileName.replace('sys_', '') === icon;

                      const backgroundColor = isCurrent ? (light ? lightColor : navColor || iconColor) : '#fff';
                      const fillColor = isCurrent ? (black || light ? iconColor : '#fff') : '#9e9e9e';

                      return (
                        <li
                          key={fileName}
                          className={cx({ isCurrentIcon: isCurrent })}
                          style={{ backgroundColor }}
                          onClick={() => onClickIcon({ icon: fileName, iconUrl })}
                        >
                          <span
                            className={fileName}
                            style={{
                              color: fillColor,
                            }}
                          ></span>
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
        {renderCommonIcon()}
        <div className="customIcon">
          {!!commonData.length && !!data.customIcon.length && <p className="iconType">{_l('自定义图标')}</p>}
          <ul className="iconsWrap">
            {data.customIcon.map(({ iconUrl, fileName }) => {
              let isCurrent = icon === fileName;
              const backgroundColor = isCurrent ? (light ? lightColor : navColor || iconColor) : '#fff';
              const fillColor = isCurrent ? (black || light ? iconColor : '#fff') : '#9e9e9e';
              return (
                <li
                  key={fileName}
                  className={cx({ isCurrentIcon: isCurrent })}
                  style={{ backgroundColor }}
                  onClick={() => onClickIcon({ icon: fileName, iconUrl })}
                >
                  <SvgIcon url={iconUrl} fill={fillColor} />
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
              primaryColor="#1677ff"
              checked={setting.isLine}
              onClick={handleSwitch}
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
