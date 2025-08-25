import React, { Component } from 'react';
import _ from 'lodash';
import CreateRecord from '../../components/createRecord';
import { getRelateDefaultValue } from '../util';
import SortableNode from './SortableNode';

export default class TreeNode extends Component {
  static propTypes = {};
  static defaultProps = {};

  render() {
    const { data, treeData, depth, ...rest } = this.props;
    const { children = [], display, pathId = [], visible = false } = data;
    if (!display) return null;
    const nodeItem = treeData[data.rowId];
    if (!nodeItem) return null;
    return (
      <div className="nodeWrap">
        {nodeItem.type === 'textTitle' ? (
          <CreateRecord treeData={treeData} itemData={data} {...this.props} />
        ) : (
          <SortableNode {...this.props} />
        )}
        {visible && !_.isEmpty(children) && (
          <div className="childNodeWrap">
            {children.map((item, index) => {
              if (!item) return null;
              const itemData = treeData[typeof item === 'string' ? item : item.rowId];
              if (!itemData) return null;
              if (itemData.type === 'textTitle') {
                return (
                  <CreateRecord
                    key={item}
                    {...this.props}
                    index={index}
                    treeData={treeData}
                    itemData={itemData}
                    handleAddRecord={() => {
                      this.props.handleAddRecord({
                        value: getRelateDefaultValue(nodeItem, {
                          currentView: this.props.view,
                          worksheetControls: this.props.controls,
                        }),
                        ..._.pick(data, ['path', 'pathId']),
                      });
                    }}
                  />
                );
              }
              return (
                <TreeNode
                  key={item.rowId}
                  depth={depth + 1}
                  pid={pathId.join('-')}
                  data={item}
                  treeData={treeData}
                  {...rest}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
