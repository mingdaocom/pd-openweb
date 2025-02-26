import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { Tree } from 'antd';
import { Icon, ScrollView, SvgIcon } from 'ming-ui';
import styled from 'styled-components';
import { getTranslateInfo } from 'src/util';

const Wrap = styled.div`
  width: 260px;
  padding: 10px;
  border-right: 1px solid #dddddd;

  .normalLineHeight {
    line-height: normal;
  }

  .appItem {
    border-radius: 4px;
    padding: 8px 6px;
    &.active {
      svg {
        fill: #2196f3 !important;
      }
      font-weight: bold;
      color: #2196f3;
      background-color: #ecf7fe;
    }
  }

  .treeWrap {
    min-height: 0;
    margin: 0 -10px;
    padding: 0 10px;
  }

  .ant-tree {
    .ant-tree-switcher-leaf-line::after {
      top: 4px;
    }
    .ant-tree-treenode-leaf-last .ant-tree-switcher-leaf-line::before {
      height: 18px !important;
    }
    .anticon-plus-square,
    .anticon-minus-square {
      svg path {
        &:first-child {
          fill: #151515;
        }
        &:last-child {
          fill: #bdbdbd;
        }
      }
    }
    .ant-tree-node-content-wrapper.ant-tree-node-selected {
      .icon {
        color: #2196f3 !important;
      }
      svg {
        fill: #2196f3 !important;
      }
      font-weight: bold;
      color: #2196f3;
      background-color: #ecf7fe;
    }
    .ant-tree-title {
      width: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ant-tree-treenode,
    .ant-tree-node-content-wrapper {
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    .ant-tree-switcher,
    .ant-tree-node-content-wrapper,
    .ant-tree-node-content-wrapper .ant-tree-iconEle {
      line-height: 36px;
    }
    .ant-tree-node-content-wrapper,
    .ant-tree-node-content-wrapper .ant-tree-iconEle {
      display: flex;
      align-items: center;
      min-height: 36px;
    }
    .ant-tree-node-content-wrapper .ant-tree-iconEle:empty {
      display: none !important;
    }
  }
`;

const sheetConfig = [
  {
    title: _l('字段'),
    type: 'control',
  },
  {
    title: _l('视图'),
    type: 'view',
  },
  {
    title: _l('自定义动作'),
    type: 'customAction',
  },
  {
    title: _l('统计图'),
    type: 'statisticsChart',
  },
  {
    title: _l('业务规则'),
    type: 'controlRules',
  },
];

const customPageConfig = [
  {
    title: _l('统计图'),
    type: 'pageStatisticsChart',
  },
  {
    title: _l('按钮'),
    type: 'pageButton',
  },
  {
    title: _l('筛选器'),
    type: 'pageFilter',
  },
  {
    title: _l('视图'),
    type: 'pageView',
  },
  {
    title: _l('富文本'),
    type: 'pageRichText',
  },
];

const getTreeData = (appId, { sections, collections, searchValue }) => {
  const getChildren = (appItem, childSections = []) => {
    if (appItem.type === 0) {
      const res = sheetConfig.map(item => {
        return {
          ...item,
          workSheetId: appItem.workSheetId,
          key: `${appItem.workSheetId}-${item.type}`,
        };
      });
      return appItem.workSheetName.toLocaleLowerCase().includes(searchValue) ? res : [];
    }
    if (appItem.type === 1 && !appItem.urlTemplate) {
      const res = customPageConfig.map(item => {
        return {
          ...item,
          workSheetId: appItem.workSheetId,
          key: `${appItem.workSheetId}-${item.type}`,
        };
      });
      return appItem.workSheetName.toLocaleLowerCase().includes(searchValue) ? res : [];
    }
    if (appItem.type === 2) {
      const subChildren = _.get(_.find(childSections, { appSectionId: appItem.workSheetId }), 'workSheetInfo') || [];
      return subChildren
        .map(subAppItem => {
          return {
            title: getTranslateInfo(appId, null, subAppItem.workSheetId).name || subAppItem.workSheetName,
            originalTitle: subAppItem.workSheetName,
            key: subAppItem.workSheetId,
            type: subAppItem.type,
            externalLinkInfo:
              appItem.type === 1 && appItem.externalLinkId
                ? { urlTemplate: appItem.urlTemplate, desc: appItem.configuration.desc }
                : undefined,
            icon: <SvgIcon className="normalLineHeight" url={subAppItem.iconUrl} fill="#9e9e9e" size={17} />,
            children: getChildren(subAppItem),
          };
        })
        .filter(n =>
          searchValue ? (n.title.toLocaleLowerCase().includes(searchValue) ? true : n.children.length) : true,
        );
    }
    return [];
  };
  const result = sections
    .map(gourup => {
      return {
        title: getTranslateInfo(appId, null, gourup.appSectionId).name || gourup.name,
        originalTitle: gourup.name,
        key: gourup.appSectionId,
        type: 2,
        icon: <Icon className="Font17 Gray_9e" icon="gourup_default" />,
        children: gourup.workSheetInfo
          .map(appItem => {
            return {
              title: getTranslateInfo(appId, null, appItem.workSheetId).name || appItem.workSheetName,
              originalTitle: appItem.workSheetName,
              key: appItem.workSheetId,
              type: appItem.type,
              externalLinkInfo:
                appItem.type === 1 && appItem.externalLinkId
                  ? { urlTemplate: appItem.urlTemplate, desc: appItem.configuration.desc }
                  : undefined,
              parentId: gourup.appSectionId,
              icon: <SvgIcon className="normalLineHeight" url={appItem.iconUrl} fill="#9e9e9e" size={17} />,
              children: getChildren(appItem, gourup.childSections),
            };
          })
          .filter(n =>
            searchValue ? (n.title.toLocaleLowerCase().includes(searchValue) ? true : n.children.length) : true,
          ),
      };
    })
    .filter(n => (searchValue ? (n.title.toLocaleLowerCase().includes(searchValue) ? true : n.children.length) : true));
  const appEntrance = [
    {
      key: 'appItemEntrance',
      title: _l('应用项'),
      selectable: false,
      children: result.length === 1 && !result[0].title ? result[0].children : result
    },
    {
      key: 'optionsEntrance',
      title: _l('选项集'),
      selectable: false,
      children: collections.map(c => {
        return {
          key: c.collectionId,
          title: getTranslateInfo(appId, null, c.collectionId).name || c.name,
          type: 'collections'
        }
      }).filter(n => (searchValue ? n.title.toLocaleLowerCase().includes(searchValue) : true))
    }
  ];
  return appEntrance;
};

const getExpandedKeys = treeData => {
  return _.flatten(
    treeData.map(item => {
      const childrenKey = item.children.map(n => n.key);
      return [item.key].concat(childrenKey);
    }),
  );
};

export default function Nav(props) {
  const { style, app, translateData } = props;
  const { expandedKeys, setExpandedKeys } = props;
  const { selectedKeys, onSelectedKeys } = props;
  const { name, iconUrl, sections, collections = [] } = app;
  const [searchValue, setSearchValue] = useState('');
  const treeData = getTreeData(app.id, {
    sections,
    collections,
    searchValue: searchValue.toLocaleLowerCase()
  });

  useEffect(() => {
    if (searchValue) {
      setExpandedKeys(getExpandedKeys(treeData));
    }
  }, [searchValue]);

  return (
    <Wrap className="flexColumn" style={style}>
      <div className="searchWrap flexRow alignItemsCenter pLeft5 mBottom10">
        <Icon className="Gray_9e Font20 mRight5" icon="search" />
        <input
          placeholder={_l('搜索')}
          className="flex"
          value={searchValue}
          onChange={e => {
            setSearchValue(e.target.value);
          }}
        />
        {searchValue && (
          <Icon className="Gray_9e pointer Font15" icon="closeelement-bg-circle" onClick={() => setSearchValue('')} />
        )}
      </div>
      <div className="treeWrap flexColumn flex">
        <div
          className={cx('flexRow alignItemsCenter pointer appItem', { active: selectedKeys.includes('app') })}
          onClick={() => {
            onSelectedKeys(['app'], { node: { ...app, type: 'app' } });
          }}
        >
          <SvgIcon url={iconUrl} fill="#9e9e9e" size={18} />
          <span className="Font13 mLeft5 ellipsis">{getTranslateInfo(app.id, null, app.id).name || name}</span>
        </div>
        <ScrollView className="flex mTop10 navScroll">
          <Tree
            showLine={{ showLeafIcon: false }}
            showIcon={true}
            expandedKeys={expandedKeys}
            onExpand={expandedKeys => {
              setExpandedKeys(expandedKeys);
            }}
            selectedKeys={selectedKeys}
            onSelect={onSelectedKeys}
            treeData={treeData}
          />
        </ScrollView>
      </div>
    </Wrap>
  );
}
