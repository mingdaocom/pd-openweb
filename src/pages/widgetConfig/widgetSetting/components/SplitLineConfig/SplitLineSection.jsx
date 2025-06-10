import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SvgIcon } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import WidgetStatus from 'src/pages/widgetConfig/widgetDisplay/components/WidgetStatus.jsx';
import { browserIsMobile } from 'src/utils/common';
import { getExpandWidgetIds } from './config';
import { SectionItemWrap } from './style';

export default function SplitLineSection(props) {
  // fromType = 'display' 表单详情
  const {
    data,
    sectionstyle,
    widgets = [],
    activeWidget = {},
    from,
    fromType,
    renderData = [],
    setNavVisible,
    worksheetId,
  } = props;
  const { enumDefault2 = 0, controlName, controlId } = data;
  const { theme = '#2196f3', color = '#151515', icon = '', hidetitle } = getAdvanceSetting(data);
  const isMobile = browserIsMobile();
  const [visible, setVisible] = useState(enumDefault2 !== 2);
  const curControls = fromType === 'display' ? renderData : _.flatten(widgets);
  const expandWidgetIds = getExpandWidgetIds(curControls, data, from);
  const $ref = useRef();
  let $originIds = useRef([]);

  useEffect(() => {
    handleExpand(enumDefault2 !== 2);
    $originIds.current = expandWidgetIds;

    if (_.isFunction(props.registerCell)) {
      props.registerCell({ handleExpand: value => handleExpand(value) });
    }
  }, [controlId]);

  useEffect(() => {
    if (!_.isEqual($originIds.current, expandWidgetIds)) {
      $originIds.current = expandWidgetIds;
      handleExpand(visible);
    }
  }, [expandWidgetIds]);

  const handleExpand = tempVisible => {
    if (hidetitle === '1' && enumDefault2 == 0) return;
    // 不折叠不能点击
    if (enumDefault2 === 0) return;
    const currentVisible = _.isUndefined(tempVisible) ? !visible : tempVisible;
    if (expandWidgetIds.length > 0) {
      setVisible(currentVisible);
      const tempIds = currentVisible ? expandWidgetIds : expandWidgetIds.reverse();

      for (var i = 0; i < expandWidgetIds.length; i++) {
        (function (i) {
          const timer = setTimeout(() => {
            const listItem =
              fromType === 'display'
                ? ($($ref.current)
                    .closest('.customFieldsContainer')
                    .find(`.customFormItem#formItem-${worksheetId}-${tempIds[i]}`) || [])[0]
                : document.getElementById(`widget-${tempIds[i]}`);
            if (listItem) {
              if (currentVisible) {
                $(listItem).slideDown(80, 'swing', () => (listItem.style.overflow = 'unset'));
              } else {
                $(listItem).slideUp(80, 'swing', () => (listItem.style.overflow = 'unset'));
              }
              clearTimeout(timer);
              if (listItem.nextElementSibling && listItem.nextElementSibling.className === 'customFormLine') {
                listItem.nextElementSibling.style.display = currentVisible ? 'flex' : 'none';
              }
            }
          }, 100);
        })(i);
      }

      if (_.isFunction(setNavVisible)) {
        const timer = setTimeout(() => {
          setNavVisible();
          clearTimeout(timer);
        }, 300);
      }
    }
  };

  const renderIcon = () => {
    // 隐藏标题+不折叠
    if (hidetitle === '1' && enumDefault2 == 0) return null;

    if (sectionstyle === '1') {
      return <div className="rangeIcon"></div>;
    }

    if (sectionstyle === '2' && enumDefault2 !== 0) {
      return (
        <span className="headerArrowIcon">
          <Icon icon="sidebar_video_tutorial" />
        </span>
      );
    }

    if (icon) {
      const { iconUrl } = safeParse(icon || '{}');
      return (
        <SvgIcon
          url={iconUrl}
          fill={theme}
          size={isMobile ? 18 : 20}
          className={cx('Width20', { mRight5: !isMobile, mRight3: isMobile })}
          style={{ flexShrink: 0 }}
        />
      );
    }
    return null;
  };

  return (
    <SectionItemWrap
      theme={theme}
      color={color}
      visible={visible}
      ref={$ref}
      sectionstyle={sectionstyle}
      enumDefault2={enumDefault2}
      hidetitle={hidetitle === '1'}
      className={isMobile ? 'mobileSectionItemWrap' : ''}
      onClick={() => {
        //先激活在折叠
        if (fromType !== 'display' && _.get(activeWidget, 'controlId') !== controlId) return;
        handleExpand();
      }}
    >
      <div className={cx('titleBox', { alignItemsCenter: isMobile })}>
        {renderIcon()}
        <div className="titleText">
          {hidetitle !== '1' && controlName}
          {fromType !== 'display' && (
            <WidgetStatus
              data={data}
              showTitle={hidetitle !== '1'}
              style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }}
            />
          )}
        </div>
      </div>

      {enumDefault2 !== 0 && sectionstyle !== '2' && expandWidgetIds.length > 0 && (
        <div className="headerArrow">
          <div className="iconBox">
            <Icon icon="arrow-down-border" />
          </div>
        </div>
      )}
    </SectionItemWrap>
  );
}
