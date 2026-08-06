import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, SvgIcon } from 'ming-ui';
import { getAdvanceSetting, getExpandWidgetIds } from '../../tools/utils';
import { SectionItemWrap } from './style';

const getFormItemMap = (container, widgetIds, worksheetId) => {
  if (!container) return {};

  const prefix = `formItem-${worksheetId}-`;
  const idSet = new Set(widgetIds.map(id => `${prefix}${id}`));
  const itemMap = {};

  container.querySelectorAll('.customFormItem').forEach(item => {
    if (idSet.has(item.id)) {
      itemMap[item.id.slice(prefix.length)] = item;
    }
  });

  return itemMap;
};

const SplitLine = props => {
  const {
    from,
    renderData = [],
    setNavVisible,
    enumDefault2 = 0,
    controlName,
    controlId,
    sectionId,
    worksheetId,
  } = props;
  const sectionstyle = _.get(props, 'widgetStyle.sectionstyle') || '0';
  const {
    theme = 'var(--color-primary)',
    color = 'var(--color-text-primary)',
    icon = '',
    hidetitle,
  } = getAdvanceSetting(props);
  const [visible, setVisible] = useState(enumDefault2 !== 2);
  const expandWidgetIds = useMemo(
    () => getExpandWidgetIds(renderData, { controlId, sectionId }, from),
    [renderData, controlId, sectionId, from],
  );
  const $ref = useRef();
  let $originIds = useRef([]);
  const expandTimerRef = useRef();
  const navTimerRef = useRef();

  const handleExpand = tempVisible => {
    // 不折叠不能点击
    if (enumDefault2 === 0) return;
    const currentVisible = _.isUndefined(tempVisible) ? !visible : tempVisible;

    if (expandWidgetIds.length > 0) {
      setVisible(currentVisible);
      const tempIds = currentVisible ? expandWidgetIds : expandWidgetIds.slice().reverse();

      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = setTimeout(() => {
        const formItemMap = getFormItemMap(
          $ref.current && $ref.current.closest('.customMobileFormContainer'),
          tempIds,
          worksheetId,
        );

        for (let i = 0; i < tempIds.length; i++) {
          const listItem = formItemMap[tempIds[i]];

          if (listItem) {
            const $listItem = $(listItem).stop(true, true);

            if (currentVisible) {
              $listItem.slideDown(80, 'swing', () => (listItem.style.overflow = 'unset'));
            } else {
              $listItem.slideUp(80, 'swing', () => (listItem.style.overflow = 'unset'));
            }

            if (listItem.nextElementSibling && listItem.nextElementSibling.className === 'customFormLine') {
              listItem.nextElementSibling.style.display = currentVisible ? 'flex' : 'none';
            }
          }
        }
      }, 100);

      if (_.isFunction(setNavVisible)) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = setTimeout(() => {
          setNavVisible();
        }, 300);
      }
    }
  };

  const renderIcon = () => {
    // 隐藏标题+不折叠
    if (hidetitle === '1' && enumDefault2 === 0) return null;

    if (sectionstyle === '1') return <div className="rangeIcon"></div>;

    if (sectionstyle === '2' && enumDefault2 !== 0) {
      return (
        <span className="headerArrowIcon">
          <Icon icon="play_circle_filled" />
        </span>
      );
    }

    if (icon) {
      const { iconUrl } = safeParse(icon || '{}');
      return <SvgIcon url={iconUrl} fill={theme} size={18} className="svgIcon" />;
    }

    return null;
  };

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

  useEffect(() => {
    return () => {
      clearTimeout(expandTimerRef.current);
      clearTimeout(navTimerRef.current);
    };
  }, []);

  return (
    <SectionItemWrap
      theme={theme}
      color={color}
      visible={visible}
      ref={$ref}
      sectionstyle={sectionstyle}
      enumDefault2={enumDefault2}
      hidetitle={hidetitle === '1'}
      onClick={() => handleExpand()}
    >
      <div className="titleBox alignItemsCenter">
        {renderIcon()}
        <div className="titleText">{hidetitle !== '1' && controlName}</div>
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
};

SplitLine.propTypes = {
  from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // 字段折叠，0默认展开，1默认收起，2不折叠
  enumDefault2: PropTypes.number,
};

export default SplitLine;
