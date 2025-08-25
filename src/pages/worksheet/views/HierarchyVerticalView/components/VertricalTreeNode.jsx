import React, { Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { browserIsMobile } from 'src/utils/common';
import CreateRecord from '../../components/createRecord';
import CreateVerticalRecord from '../../components/CreateVerticalRecord';
import AddRecord from '../../HierarchyView/components/AddRecord';
import TreeNode from '../../HierarchyView/components/TreeNode';
import { getRelateDefaultValue } from '../../HierarchyView/util';
import { isTextTitle } from '../../util';
import VerticalSortableRecordItem from './VerticalSortableNode';

const ParentNodeWrap = styled.div`
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #151515;
  position: relative;
  .rootAddRecord {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 6px);
    z-index: 9;
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: center;
    .addHierarchyRecord {
      visibility: hidden;
    }
  }
  .rootAddRecord:hover {
    .addHierarchyRecord {
      visibility: visible;
    }
  }
`;

const VerticalTreeChildNode = styled.div(
  ({ isFirst = false }) => `
  display: flex;
  margin-top: ${isFirst ? 40 : 70}px;
  position: relative;
  gap: 10px;
  >div::after {
    top: -40px;
    left: calc(50% - 1px);
    position: absolute;
    width: 2px;
    height: 20px;
    background: #d3d3d3;
    content: '';
  }
  >div.mixTreeNode::after {
    display: none;
  }
  >div:nth-child(1) > .sortableVerticalTreeNodeWrap::before {
    left: calc(50% - 1px);
  }
  >div.mixNode:nth-child(1) > .sortableVerticalTreeNodeWrap.w240::before {
    left: 119px;
  }
  >div.mixNode:nth-child(1) > .sortableVerticalTreeNodeWrap.w280::before {
    left: 139px;
  }
  >div:last-child > .sortableVerticalTreeNodeWrap::before {
    right: calc(50% - 1px);
  }
  >div.mixNode:last-child > .sortableVerticalTreeNodeWrap.w240::before {
    width: 119px;
  }
  >div.mixNode:last-child > .sortableVerticalTreeNodeWrap.w280::before {
    width: 139px;
  }
`,
);

function VertricalTreeNode(props) {
  const {
    data,
    treeData,
    stateTree,
    depth,
    isRoot = false,
    view,
    isNarrow = false,
    showTopAdd = false,
    handleAddRecord,
    controls,
  } = props;
  const { children = [], display, pathId = [], visible = false } = data;
  const { advancedSetting = {} } = view;

  if (!display && !isRoot) return null;
  const nodeItem = treeData[data.rowId];
  if (!nodeItem && !isRoot) return null;

  const IS_MOBILE = browserIsMobile();

  const checkedDepth = () => {
    let childrenData = isRoot && Object.keys(stateTree).length > 1 ? props.stateTree : children;

    if ((!visible || _.isEmpty(childrenData)) && !isRoot) return false;

    if (advancedSetting.hierarchyViewType === '2' && depth >= (advancedSetting.minHierarchyLevel || '2') - 1)
      return true;

    return false;
  };

  const renderParent = () => {
    if (isRoot && Object.keys(stateTree).length > 1) {
      return (
        <ParentNodeWrap id="vertricalRoot" className="parentNodeWrap">
          <span className="vertricalRootContent">
            {_l('所有数据')}
            {!IS_MOBILE && showTopAdd && (
              <span className="rootAddRecord">
                <AddRecord
                  onAdd={() => {
                    handleAddRecord({
                      isTextTitle: isTextTitle(controls),
                      path: [],
                      pathId: [],
                    });
                  }}
                />
              </span>
            )}
          </span>
        </ParentNodeWrap>
      );
    }

    return nodeItem && nodeItem.type === 'textTitle' ? (
      <CreateVerticalRecord treeData={treeData} itemData={data} {...props} />
    ) : (
      <VerticalSortableRecordItem {...props} positionStart={checkedDepth()} />
    );
  };

  const renderChild = () => {
    let flag = isRoot && Object.keys(stateTree).length > 1;
    let childrenData = flag ? props.stateTree : children;
    if ((!visible || _.isEmpty(childrenData)) && nodeItem) return null;

    return (
      <VerticalTreeChildNode isFirst={isRoot}>
        {childrenData.map((item, index) => {
          if (!item) return null;

          const itemData = treeData[typeof item === 'string' ? item : item.rowId];

          if (!itemData) return null;

          let condition =
            advancedSetting.hierarchyViewType === '2' && depth >= (advancedSetting.minHierarchyLevel || '2') - 1;

          if (itemData.type === 'textTitle') {
            return condition ? (
              <div className={`mixTreeNode ${isNarrow ? 'coverpositionTop' : 'coverpositionAlign'}`}>
                <div className="nodeWrap">
                  <CreateRecord
                    key={item}
                    {...props}
                    index={index}
                    treeData={treeData}
                    itemData={itemData}
                    broCount={childrenData.length}
                    handleAddRecord={() => {
                      props.handleAddRecord({
                        value: getRelateDefaultValue(nodeItem, {
                          currentView: props.view,
                          worksheetControls: props.controls,
                        }),
                        ..._.pick(data, ['path', 'pathId']),
                      });
                    }}
                    isStraightLine={true}
                  />
                </div>
              </div>
            ) : (
              <CreateVerticalRecord
                key={item}
                {...props}
                index={index}
                treeData={treeData}
                itemData={itemData}
                broCount={childrenData.length}
                handleAddRecord={() => {
                  props.handleAddRecord({
                    value: getRelateDefaultValue(flag ? item : nodeItem, {
                      currentView: props.view,
                      worksheetControls: props.controls,
                    }),
                    ..._.pick(flag ? item : data, ['path', 'pathId']),
                  });
                }}
              />
            );
          }

          if (condition) {
            // 上 2 86 左 1 125 右 0 125

            return (
              <Fragment>
                <div className={`mixTreeNode ${isNarrow ? 'coverpositionTop' : 'coverpositionAlign'}`}>
                  <TreeNode
                    {...props}
                    key={item.rowId}
                    depth={depth + 1}
                    pid={pathId.join('-')}
                    data={item}
                    treeData={treeData}
                    isStraightLine={true}
                  />
                </div>
              </Fragment>
            );
          }

          return (
            <VertricalTreeNode
              {...props}
              key={item.rowId}
              depth={depth + 1}
              data={item}
              isRoot={false}
              treeData={treeData}
              pid={isRoot && Object.keys(stateTree).length > 1 ? 'vertricalRoot' : pathId.join('-')}
              index={index}
            />
          );
        })}
      </VerticalTreeChildNode>
    );
  };

  return (
    <div className={checkedDepth() ? 'mixNode' : ''}>
      {renderParent()}
      {renderChild()}
    </div>
  );
}

export default VertricalTreeNode;
