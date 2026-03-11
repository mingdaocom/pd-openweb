import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView, SvgIcon, Switch } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import './iconfont/iconly.css';
import './index.less';

const SYSTEM_TYLE = [
  { label: _l('常用'), key: 'general' },
  { label: _l('办公'), key: 'office' },
  { label: _l('财务'), key: 'finance' },
  { label: _l('物体'), key: 'object' },
  { label: _l('人物'), key: 'character' },
  { label: _l('符号'), key: 'symbol' },
  { label: _l('自然'), key: 'nature' },
  { label: _l('服饰'), key: 'costume' },
  { label: _l('饮食'), key: 'biteAndSup' },
  { label: _l('活动'), key: 'activity' },
  { label: _l('交通'), key: 'traffic' },
  { label: _l('地点'), key: 'place' },
];

const TABS = [
  { text: _l('最近使用'), value: 2 },
  { text: _l('默认'), value: 0 },
  { text: _l('自定义'), value: 1 },
];

const isCustomIcon = icon => !icon.startsWith('sys_');

function IconTabs(props) {
  const { iconColor, hideCustom, icon, projectId, handleClick, navColor, onClearIcon } = props;
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
    tab: hideCustom ? 0 : !_.isUndefined(commonSetting.tab) ? commonSetting.tab : isCustomIcon(icon) ? 1 : 0, // 0默认 1自定义 2最近使用
    firstLoad: true,
    changeScrollTop: '0',
  });
  const [data, setData] = useState({
    systemIconLine: {},
    systemIcon: {},
    customIcon: [],
    searchIcon: [],
  });
  const [keyword, setKeyword] = useState('');
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
          ).splice(0, 50),
        ),
      );
    };
  }, []);

  useEffect(() => {
    getIcon();
    safeLocalStorageSetItem('md_common_icon_setting', JSON.stringify({ ..._.pick(setting, ['isLine', 'tab']) }));
  }, [setting.isLine, setting.tab, keyword]);

  const getIcon = () => {
    const { systemIconLine, systemIcon, customIcon } = data;
    const { isLine, tab } = setting;

    if (
      tab === 2 ||
      (tab === 1 && customIcon.length > 0) ||
      (tab === 0 && !keyword && Object.keys(isLine ? systemIconLine : systemIcon).length > 0)
    ) {
      return;
    }

    setLoading(true);

    ajaxRequest
      .getIcon({ projectId, iconType: tab === 0, keyword, isLine: tab === 0 ? isLine : undefined })
      .then(res => {
        let field = tab === 1 ? 'customIcon' : keyword ? 'searchIcon' : isLine ? 'systemIconLine' : 'systemIcon';
        setData({ ...data, [field]: res });
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
    setSetting({ ...setting, currentKey: item.key });
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
        <ul className="iconsWrap">
          {commonData.map(l => {
            const isCustom = isCustomIcon(l.icon);
            const iconItem = getIconName(l.icon, setting.isLine);
            const isCurrent = iconItem === icon;
            const backgroundColor = isCurrent
              ? light
                ? lightColor
                : navColor || iconColor
              : 'var(--color-background-primary)';
            const fillColor = isCurrent
              ? black || light
                ? iconColor
                : 'var(--color-white)'
              : 'var(--color-text-tertiary)';

            return (
              <li
                key={`common-icons-${l.icon}`}
                className={cx({ isCurrentIcon: isCurrent })}
                style={{ backgroundColor }}
                onClick={() => {
                  onClickIcon({ icon: iconItem, iconUrl: isCustom ? l.iconUrl : l.iconUrl.replace(l.icon, iconItem) });
                }}
              >
                {isCustom ? (
                  <SvgIcon url={l.iconUrl} fill={fillColor} />
                ) : (
                  <span className={iconItem} style={{ color: fillColor }}></span>
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

    let listData = keyword ? data.searchIcon : isLine ? data.systemIconLine : data.systemIcon;

    if (loading) return <LoadDiv className="mTop10" />;

    if (Object.keys(listData).length === 0)
      return keyword ? (
        <div className="h100 flexColumn alignItemsCenter justifyContentCenter Font14 textSecondary">
          {_l('无匹配图标，请调整关键词')}
        </div>
      ) : null;

    const renderList = list => {
      return list.map(({ fileName, iconUrl }) => {
        let isCurrent = icon.startsWith('sys_') ? icon === fileName : fileName.replace('sys_', '') === icon;

        const backgroundColor = isCurrent
          ? light
            ? lightColor
            : navColor || iconColor
          : 'var(--color-background-primary)';
        const fillColor = isCurrent
          ? black || light
            ? iconColor
            : 'var(--color-white)'
          : 'var(--color-text-tertiary)';

        return (
          <li
            key={fileName}
            className={cx({ isCurrentIcon: isCurrent })}
            style={{ backgroundColor }}
            onClick={() => onClickIcon({ icon: fileName, iconUrl })}
          >
            <span className={fileName} style={{ color: fillColor }}></span>
          </li>
        );
      });
    };

    if (keyword) {
      return (
        <ScrollView className="iconsScrollViewWrap">
          <div className="searchIcon">
            <div className="iconsWrap">{renderList(listData)}</div>
          </div>
        </ScrollView>
      );
    }

    return (
      <React.Fragment>
        <div className="iconTypeList">
          {typePage !== 0 && (
            <div className="preButton" onClick={() => setTypePage(0)}>
              <i className="icon-next-02 font10 textTertiary"></i>
            </div>
          )}
          <div className="iconTypeCon">
            <ul style={{ transform: `translateX(${typePage * -352}px)` }}>
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
            <div className="nextButton" onClick={() => setTypePage(1)}>
              <i className="icon-next-02 font10 textTertiary"></i>
            </div>
          )}
        </div>

        <ScrollView ref={scrollRef} className="iconsScrollViewWrap" onScroll={onScroll} disableParentScroll>
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
                    {renderList(listData[item.key])}
                  </ul>
                </React.Fragment>
              );
            })}
          </div>
        </ScrollView>
      </React.Fragment>
    );
  };

  const renderCustomIcon = () => {
    if (hideCustom) return null;

    if (loading) return <LoadDiv className="mTop10" />;

    return (
      <ScrollView className="iconsScrollViewWrap">
        <div className="customIcon">
          <ul className="iconsWrap">
            {data.customIcon.map(({ iconUrl, fileName }) => {
              let isCurrent = icon === fileName;
              const backgroundColor = isCurrent
                ? light
                  ? lightColor
                  : navColor || iconColor
                : 'var(--color-background-primary)';
              const fillColor = isCurrent
                ? black || light
                  ? iconColor
                  : 'var(--color-white)'
                : 'var(--color-text-tertiary)';
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
          {TABS.map(item => {
            if (item.value === 1 && hideCustom) return null;

            return (
              <span
                key={item.value}
                className={cx('navTab', { active: setting.tab === item.value })}
                onClick={() => {
                  setSetting({ ...setting, tab: item.value });
                  setKeyword('');
                }}
              >
                {item.text}
              </span>
            );
          })}
        </div>

        <div className="flexRow alignItemsCenter">
          {onClearIcon && icon && (
            <div className="pointer textSecondary mRight16" onClick={onClearIcon}>
              {_l('清除')}
            </div>
          )}
          {setting.tab === 0 && (
            <Fragment>
              <SearchInput
                className="searchCon"
                placeholder={_l('搜索')}
                value={keyword}
                onChange={_.debounce(value => {
                  setKeyword(value);
                }, 500)}
              />
              <div className="switchCon">
                <Switch
                  primaryColor="#1677ff"
                  checked={setting.isLine}
                  onClick={handleSwitch}
                  text={setting.isLine ? _l('线框') : _l('填充')}
                />
              </div>
            </Fragment>
          )}
        </div>
      </div>
      <div className="contentCon">
        {setting.tab === 2 && renderCommonIcon()}
        {setting.tab === 0 && renderSystemIcon()}
        {setting.tab === 1 && renderCustomIcon()}
      </div>
    </div>
  );
}

export default memo(IconTabs);
