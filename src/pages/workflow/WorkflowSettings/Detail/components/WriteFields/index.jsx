import React, { Component } from 'react';
import './index.less';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import flowNode from '../../../../api/flowNode';

const READ_TYPE = [20, 22, 25, 30, 31, 32, 33, 34, 37, 38];

export default class WriteFields extends Component {
  static defaultProps = {
    processId: '',
    nodeId: '',
    selectNodeId: '',
    data: [],
    hideTypes: [],
    readonlyControlTypes: [],
    updateSource: () => {},
  };

  componentDidMount() {
    const { selectNodeId, data } = this.props;

    if (selectNodeId && !data.length) {
      this.getNodeFormProperty(selectNodeId);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeFormProperty(nextProps.selectNodeId);
    }
  }

  /**
   * 获取字段列表
   */
  getNodeFormProperty(selectNodeId) {
    const { processId, nodeId, updateSource } = this.props;

    flowNode.getNodeFormProperty({ processId, nodeId, selectNodeId }).then(result => {
      updateSource({ formProperties: result });
    });
  }

  /**
   * 是否禁用
   */
  isDisabled(item, type) {
    const { readonlyControlTypes } = this.props;

    if (
      _.includes(READ_TYPE.concat(readonlyControlTypes), item.type) ||
      item.type > 10000 ||
      (item.type === 29 && item.showType === '2') ||
      (item.type === 43 && type === 'REQUIRED')
    ) {
      return true;
    }

    return false;
  }

  /**
   * 全选操作
   */
  updateAllSettings({ key, checked }) {
    const { data, updateSource } = this.props;
    const formProperties = _.cloneDeep(data);

    if (key === 'LOOK') {
      formProperties.forEach(item => {
        if (!checked) {
          item.property = 4;
        } else if (item.property === 4) {
          item.property = 1;
        }
      });
    }

    if (key === 'EDIT') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item)) {
          if (!checked) {
            item.property = 1;
          } else if (_.includes([1, 4], item.property)) {
            item.property = 2;
          }
        }
      });
    }

    if (key === 'REQUIRED') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item, 'REQUIRED')) {
          if (!checked) {
            item.property = 2;
          } else if (_.includes([1, 2, 4], item.property)) {
            item.property = 3;
          }
        }
      });
    }

    updateSource({ formProperties });
  }

  onChange(id, property) {
    const { data, updateSource } = this.props;
    const formProperties = _.cloneDeep(data);

    formProperties.forEach(item => {
      if (item.id === id) {
        item.property = property;
      }
    });

    updateSource({ formProperties });
  }

  render() {
    const { data, hideTypes } = this.props;

    return (
      <ul className={cx('mTop15', { flowDetailWriteControls: data.length })}>
        <li className="flexRow" style={{ background: '#f4f4f4' }}>
          <div className="flex"></div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 1) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('查看')}
                checked={!data.filter(item => item.property === 4).length}
                onClick={checked => this.updateAllSettings({ key: 'LOOK', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 2) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('编辑')}
                checked={
                  data.filter(item => item.property === 2 || item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item)).length
                }
                onClick={checked => this.updateAllSettings({ key: 'EDIT', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16 mRight16">
            {!_.includes(hideTypes, 3) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('必填')}
                checked={
                  data.filter(item => item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item, 'REQUIRED')).length
                }
                onClick={checked => this.updateAllSettings({ key: 'REQUIRED', checked: !checked })}
              />
            )}
          </div>
        </li>
        {data.map((item, i) => {
          return (
            <li className="flexRow" key={i}>
              <div className="flex">
                <div className="ellipsis" title={item.name || (item.type === 22 ? _l('分段') : _l('备注'))}>
                  {item.name || (item.type === 22 ? _l('分段') : _l('备注'))}
                </div>
              </div>
              <div className="mLeft16">
                {!_.includes(hideTypes, item.property) && (
                  <Checkbox
                    checked={item.property !== 4}
                    onClick={checked => this.onChange(item.id, checked ? 4 : 1)}
                  />
                )}
              </div>
              <div className="mLeft16">
                {!this.isDisabled(item) && !_.includes(hideTypes, 2) && (
                  <Checkbox
                    checked={item.property === 2 || item.property === 3}
                    onClick={checked => this.onChange(item.id, checked ? 1 : 2)}
                  />
                )}
              </div>
              <div className="mLeft16 mRight16">
                {!this.isDisabled(item, 'REQUIRED') && !_.includes(hideTypes, 3) && (
                  <Checkbox
                    checked={item.property === 3}
                    onClick={checked => this.onChange(item.id, checked ? 2 : 3)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}
