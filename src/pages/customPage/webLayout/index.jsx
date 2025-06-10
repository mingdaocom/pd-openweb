import React, { useState, memo, useRef, Fragment, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { EditWidget, WidgetList, WidgetContent } from '../components';
import cx from 'classnames';
import _ from 'lodash';
import { replaceColor, isLightColor } from 'src/pages/customPage/util';
import { updatePageInfo } from 'src/pages/customPage/redux/action';
import { ReactSVG } from 'react-svg';
import { bgImages } from '../components/ConfigSideWrap/BgConfig';
import { TinyColor } from '@ctrl/tinycolor';

const BgImageWrap = styled(ReactSVG)`
  >div, >div>svg {
    height: 100%;
    width: 100%;
  }
`;

const ContentWrap = styled.div`
  box-sizing: border-box;
  justify-content: center;
  padding: 0 8px;
  padding-top: 4px;
  background-color: #f5f5f5;
  height: 100%;
  flex: 1;
  overflow: auto;
  &.componentsEmpty {
    display: flex;
    align-items: center;
  }
  .empty {
    .iconWrap {
      box-sizing: border-box;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      margin: 0 auto;
      background-color: var(--bg-color);
      text-align: center;
      padding-top: 35px;
      i {
        font-size: 60px;
        color: #bdbdbd;
      }
    }
    p {
      text-align: center;
      font-size: 15px;
      color: var(--title-color);
    }
  }

  .componentsWrap {
    padding: 0 0 4px 0;
    height: 100%;
  }
`;

const getTabsContainerForCard = event => {
  const tabContainers = document.querySelectorAll('.widgetContent.tabs, .widgetContent.card');
  for (let container of tabContainers) {
    if (container.contains(event.target)) {
      return container.querySelector('.tabs') || container.querySelector('.card');
    }
  }
  return null;
}
const getTabsIdentifierId = (classNames = '') => {
  const match = classNames.match(/tabs-([a-f0-9-]+)/) || classNames.match(/card-([a-f0-9-]+)/);
  return match ? match[1] : null;
}
const getTabIdentifierId = (classNames = '') => {
  const match = classNames.match(/tab-([a-f0-9-]+)/);
  return match ? match[1] : null;
}

function webLayout(props) {
  const { editable = true, updateWidget = _.noop, className = '', emptyPlaceholder, config, appPkg, delWidget, ...rest } = props;
  const [editingWidget, setWidget] = useState({});
  const $ref = useRef(null);
  const { adjustScreen } = rest;
  const iconColor = appPkg.iconColor || rest.apk.iconColor;
  const pageConfig = replaceColor(config || {}, iconColor);
  const components = props.components || [];
  const bgIsDark = pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor);
  const widgetIsDark = pageConfig.widgetBgColor && !isLightColor(pageConfig.widgetBgColor);
  const backgroundColor = appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor;
  const lowAlphaIconColor = new TinyColor(iconColor).setAlpha(0.25).toRgbString();

  useEffect(() => {
    const componentsWrap = document.querySelector('#componentsWrap');
    const handleClickActiveWrap = event => {
      const tabsContainer = getTabsContainerForCard(event);
      if (tabsContainer) {
        const sectionId = getTabsIdentifierId(tabsContainer.className);
        const tabId = event.target.classList.contains('tab') ? getTabIdentifierId(event.target.className) : getTabIdentifierId(_.get(tabsContainer.querySelector('.tabsHeader .tab.active') || tabsContainer.querySelector('.tabsHeader .tab'), 'className'));
        props.updatePageInfo({
          activeContainerInfo: {
            sectionId,
            tabId
          }
        });
      } else {
        props.updatePageInfo({
          activeContainerInfo: {}
        });
      }
    }
    if (editable) {
      componentsWrap.addEventListener('click', handleClickActiveWrap);
    }
    return () => {
      componentsWrap.removeEventListener('click', handleClickActiveWrap);
    }
  }, []);

  const renderPageBgImage = () => {
    return (
      <BgImageWrap
        className="Absolute w100"
        style={{ pointerEvents: 'none', top: editable ? 0 : -44, height: `calc(100% + ${editable ? 0 : 44}px)` }}
        src={_.get(_.find(bgImages, { name: pageConfig.pageBgImage }), 'value')}
        beforeInjection={svg => {
          svg.setAttribute('fill', lowAlphaIconColor);
          svg.setAttribute('preserveAspectRatio', 'none');
        }}
      />
    );
  }

  return (
    <Fragment>
      {editable && <WidgetList {...props} />}
      {pageConfig.pageBgImage && !editable && (
        renderPageBgImage()
      )}
      <ContentWrap
        ref={$ref}
        className={cx(className, {
          componentsEmpty: components <= 0,
          Relative: components <= 0 && editable,
          adjustScreen
        })}
        id="componentsWrap"
        style={{
          backgroundColor,
          '--title-color': bgIsDark ? '#ffffffcc' : '#333',
          '--icon-color': bgIsDark ? '#ffffffcc' : '#9e9e9e',
          '--bg-color': bgIsDark ? '#e6e6e633' : '#e6e6e6',
          '--widget-color': pageConfig.widgetBgColor,
          '--widget-title-color': widgetIsDark ? '#ffffffcc' : '#333',
          '--widget-icon-color': widgetIsDark ? '#ffffffcc' : '#9e9e9e',
          '--widget-icon-hover-color': widgetIsDark ? '#ffffff' : '#2196f3',
        }}
      >
        {pageConfig.pageBgImage && editable && (
          renderPageBgImage()
        )}
        {components.length > 0 ? (
          <div className="componentsWrap">
            <WidgetContent
              {...props}
              components={components}
              editingWidget={editingWidget}
              setWidget={setWidget}
              config={pageConfig}
              widgetIsDark={widgetIsDark}
            />
          </div>
        ) : (
          emptyPlaceholder || (
            <div className="empty">
              <div className="addWidgetPic"></div>
              <p>{_l('从左侧添加组件，开始创建页面')}</p>
            </div>
          )
        )}
        {!_.isEmpty(editingWidget) && (
          <EditWidget
            mode="update"
            widget={editingWidget}
            onClose={() => setWidget({})}
            updateWidget={updateWidget}
            {...rest}
          />
        )}
      </ContentWrap>
    </Fragment>
  );
}

export default connect(
  state => ({
    components: state.customPage.components,
    apk: state.customPage.apk,
  }),
  dispatch => bindActionCreators({ updatePageInfo }, dispatch)
)(memo(webLayout));
