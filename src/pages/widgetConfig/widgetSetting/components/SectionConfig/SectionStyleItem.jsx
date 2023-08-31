import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { Icon } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import { SectionItemWrap, SectionHeader, DefaultEmpty } from './style';
import SvgIcon from 'src/components/SvgIcon';
import WidgetStatus from 'src/pages/widgetConfig/widgetDisplay/components/WidgetStatus.jsx';
import { isEmpty } from 'lodash';
import { browserIsMobile } from 'src/util';

const { Panel } = Collapse;

export default function SectionStyleItem(props) {
  const { data, activeWidget, from } = props;
  // from：setting: 配置dropdown，display: 配置呈现, detail: 记录详情
  const { enumDefault, enumDefault2, controlName, controlId } = data;
  const [activeKey, setActiveKey] = useState();

  const { theme, title, titlealign, background, icon = '' } = getAdvanceSetting(data);
  const { iconUrl } = safeParse(icon || '{}');
  const noBorder = from === 'setting' && _.includes([0, 1, 2], enumDefault);
  const showArrow = from !== 'setting' && enumDefault2 !== 0;
  const collapsible = from === 'setting' || enumDefault2 === 0 ? 'disabled' : 'header';
  // 这两个类型定死icon颜色
  const iconColor = _.includes([2, 6], enumDefault) ? '#fff' : theme;
  const isMobile = browserIsMobile();

  useEffect(() => {
    setActiveKey(enumDefault2 !== 2 ? [controlId] : []);
  }, [enumDefault2]);

  const renderStatus = () => {
    if (from !== 'setting') {
      return <WidgetStatus data={data} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
    }
    return null;
  };

  const renderIcon = () => {
    if (enumDefault === 1 && !iconUrl) {
      return <div className="rangeIcon"></div>;
    }
    if (iconUrl) {
      return <SvgIcon url={iconUrl} fill={iconColor} size={22} className="mRight8" />;
    }
    return null;
  };

  const renderArrow = () => {
    if (showArrow) {
      return (
        <div className="headerArrow">
          <Icon icon={isMobile ? 'arrow-down-border' : 'arrow-right-border'} />
        </div>
      );
    }
    return null;
  };

  const renderHeader = () => {
    const headerProp = {
      theme,
      title,
      titlealign,
      iconColor,
      visible: !isEmpty(activeKey),
      background: _.includes([0, 1], enumDefault) ? '' : enumDefault === 6 ? theme : background,
      borderTop: _.includes([4], enumDefault),
      enumDefault,
    };
    return (
      <SectionHeader {...headerProp} className={isMobile ? 'mobileSectionHeader' : ''}>
        <div className="headerContent">
          <div className="titleBox">
            {renderIcon()}
            <div className="titleText">
              {controlName}
              {renderStatus()}
            </div>
          </div>
        </div>

        {renderArrow()}
      </SectionHeader>
    );
  };

  const renderContent = () => {
    return (
      <Panel header={renderHeader()} key={controlId} showArrow={false} collapsible={collapsible}>
        {from === 'setting' ? <DefaultEmpty /> : props.children}
      </Panel>
    );
  };

  return (
    <SectionItemWrap
      background={_.includes([0, 1], enumDefault) ? '' : background}
      className={isMobile ? 'mobileSectionItemWrap' : ''}
    >
      <Collapse
        key={controlId}
        bordered={!noBorder}
        activeKey={activeKey}
        onChange={value => {
          // 配置呈现侧点击事件，先激活在折叠
          if ((from === 'display' && activeWidget.type === 52) || from === 'detail') {
            setActiveKey(value);
          }
        }}
      >
        {renderContent()}
      </Collapse>
    </SectionItemWrap>
  );
}
