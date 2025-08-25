import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { containerWidgets, widgets } from '../../enum';
import { componentCountLimit, getEnumType } from '../../util';
import EditWidget from '../editWidget';

const WidgetWrap = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: #fff;
  padding: 10px;
  .header {
    padding-left: 12px;
    line-height: 36px;
    span {
      color: #757575;
    }
    .iconWrap {
      margin-left: 6px;
    }
  }
  .widgetList {
    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 4px;
      line-height: 44px;
      cursor: pointer;
      span {
        margin-left: 12px;
        font-size: 14px;
      }
      .add {
        visibility: hidden;
      }
      &:hover {
        background-color: #f5f5f5;
        .add {
          visibility: visible;
        }
      }
    }
  }
`;

function WidgetList({ components, activeContainerInfo = {}, addWidget = _.noop, ...rest }) {
  const [createWidget, setWidget] = useState({});
  const renderWidget = key => {
    const { icon, name } = { ...widgets, ...containerWidgets }[key];
    return (
      <li
        key={key}
        onClick={() => {
          if (!componentCountLimit(components)) return;
          const type = getEnumType(key);
          if (containerWidgets[key]) {
            const componentConfig =
              key === 'tabs'
                ? {
                    showType: 1,
                    showBorder: true,
                    name: _l('标签') + (components.filter(c => [9, 'tabs'].includes(c.type)).length || ''),
                    tabs: Array.from({ length: 3 }, (_, index) => {
                      return {
                        id: uuidv4(),
                        name: _l('标签页%0', index + 1),
                      };
                    }),
                  }
                : {
                    showType: 2,
                    showBorder: true,
                    showName: true,
                    name: _l('卡片') + (components.filter(c => [10, 'card'].includes(c.type)).length || ''),
                    tabs: [],
                  };
            addWidget({
              type,
              config: {
                objectId: uuidv4(),
              },
              componentConfig,
            });
            setTimeout(() => {
              const componentsWrap = document.querySelector('#componentsWrap');
              componentsWrap.scrollTop = componentsWrap.scrollHeight;
            });
          } else if (key === 'image') {
            addWidget({
              type,
              componentConfig: {
                showType: 1,
                showName: false,
                name: _l('图片') + (components.filter(c => [11, 'image'].includes(c.type)).length || ''),
              },
              sectionId: activeContainerInfo.sectionId || undefined,
              tabId: activeContainerInfo.tabId || undefined,
            });
            const containerId = activeContainerInfo.sectionId || activeContainerInfo.tabId;
            if (!containerId) {
              setTimeout(() => {
                const componentsWrap = document.querySelector('#componentsWrap');
                componentsWrap.scrollTop = componentsWrap.scrollHeight;
              });
            }
          } else if (key === 'richText') {
            addWidget({
              type,
              componentConfig: {
                showType: 1,
                name: _l('文本') + (components.filter(c => [2, 'richText'].includes(c.type)).length || ''),
              },
              value: `<h1><strong>${_l('在这里拟定一个标题')}</strong></h1><p>${_l('快来开始创作吧！')}</p>`,
              editRichText: true,
              sectionId: activeContainerInfo.sectionId || undefined,
              tabId: activeContainerInfo.tabId || undefined,
            });
            const containerId = activeContainerInfo.sectionId || activeContainerInfo.tabId;
            if (!containerId) {
              setTimeout(() => {
                const componentsWrap = document.querySelector('#componentsWrap');
                componentsWrap.scrollTop = componentsWrap.scrollHeight;
              });
            }
          } else {
            setWidget({ type: key });
          }
        }}
      >
        <i className={`Font18 icon-${icon} Gray_75`}></i>
        <span>{name}</span>
        <span className="flex" />
        <i className="add icon-add Font18 Gray_75"></i>
      </li>
    );
  };
  return (
    <WidgetWrap>
      <div className="header">
        <span className="Bold">{_l('添加组件')}</span>
      </div>
      <ul className="widgetList">{_.keys(widgets).map(renderWidget)}</ul>
      <div className="header mTop10">
        <span className="Bold">{_l('容器')}</span>
      </div>
      <ul className="widgetList">{_.keys(containerWidgets).map(renderWidget)}</ul>
      {!_.isEmpty(createWidget) && (
        <EditWidget mode="add" onClose={() => setWidget({})} widget={createWidget} addWidget={addWidget} {...rest} />
      )}
    </WidgetWrap>
  );
}

export default connect(state => ({
  activeContainerInfo: state.customPage.activeContainerInfo,
}))(WidgetList);
