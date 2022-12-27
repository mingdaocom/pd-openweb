import React, { Component, Fragment } from 'react';
import { Checkbox, Icon, Dialog, Switch } from 'ming-ui';
import flowNode from '../../../../api/flowNode';
import _ from 'lodash';
import styled from 'styled-components';

const READ_TYPE = [20, 22, 25, 30, 31, 32, 33, 34, 37, 38, 45, 47];

const Box = styled.ul`
  > li {
    align-items: center;
    height: 40px;
    border-bottom: 1px solid #e0e0e0;
    > div.flex {
      min-width: 0;
    }
    > div:not(.flex) {
      width: 84px;
    }
    .tip-bottom-left {
      &:after {
        width: 200px;
        white-space: normal;
      }
    }
  }
`;

export default class WriteFields extends Component {
  static defaultProps = {
    processId: '',
    nodeId: '',
    selectNodeId: '',
    data: [],
    hideTypes: [],
    readonlyControlTypes: [],
    updateSource: () => {},
    showCard: false,
  };

  state = {
    showTableControls: false,
    selectControlId: '',
    subFormProperties: [],
    isWorkflow: false,
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
      (_.includes([43, 49], item.type) && type === 'REQUIRED')
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
    const { showTableControls, subFormProperties } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? subFormProperties : data);

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

    if (showTableControls) {
      this.setState({ subFormProperties: formProperties });
    } else {
      updateSource({ formProperties });
    }
  }

  onChange(id, property) {
    const { data, updateSource } = this.props;
    const { showTableControls, subFormProperties } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? subFormProperties : data);

    formProperties.forEach(item => {
      if (item.id === id) {
        item.property = property;
      }
    });

    if (showTableControls) {
      this.setState({ subFormProperties: formProperties });
    } else {
      updateSource({ formProperties });
    }
  }

  onChangeCard(id, showCard) {
    const { data, updateSource } = this.props;
    const formProperties = _.cloneDeep(data);

    if (formProperties.filter(item => !!item.showCard).length >= 8 && !!showCard) {
      alert(_l('最多可设置8个字段'), 2);
      return;
    }

    formProperties.forEach(item => {
      if (item.id === id) {
        item.showCard = showCard;
      }
    });

    updateSource({ formProperties });
  }

  renderContent(data, showCard) {
    const { hideTypes } = this.props;

    return (
      <Box className="mTop15">
        <li className="flexRow" style={{ background: '#f4f4f4' }}>
          <div className="flex" />
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
          <div className="mLeft16">
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
          {showCard && (
            <div className="mLeft16 mRight16 cursorDefault" style={{ width: 60 }}>
              <span
                className="tip-bottom-left"
                data-tip={_l('指定摘要字段，显示在我的流程列表中，方便快速了解待处理事项的内容。')}
              >
                {_l('摘要')}
              </span>
            </div>
          )}
        </li>
        {data.map((item, i) => {
          return (
            <li className="flexRow" key={i}>
              <div className="flex flexRow alignItemsCenter">
                <div className="ellipsis" title={item.name || (item.type === 22 ? _l('分段') : _l('备注'))}>
                  {item.name || (item.type === 22 ? _l('分段') : _l('备注'))}
                </div>
                {/* {item.type === 29 && !!item.subFormProperties.length && (
                  <div
                    data-tip={_l('设置列权限')}
                    className="mLeft5 Gray_9e ThemeHoverColor3 pointer"
                    style={{ display: 'inline-flex' }}
                    onClick={() =>
                      this.setState({
                        showTableControls: true,
                        selectControlId: item.id,
                        subFormProperties: item.subFormProperties,
                        isWorkflow: item.isWorkflow,
                      })
                    }
                  >
                    <Icon type="settings" className="Font16" />
                  </div>
                )} */}
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
              <div className="mLeft16">
                {!this.isDisabled(item, 'REQUIRED') && !_.includes(hideTypes, 3) && (
                  <Checkbox
                    checked={item.property === 3}
                    onClick={checked => this.onChange(item.id, checked ? 2 : 3)}
                  />
                )}
              </div>
              {showCard && (
                <div className="mLeft16 mRight16" style={{ width: 60 }}>
                  {!_.includes([14, 21, 40, 41, 42, 43, 45, 47, 49], item.type) && (
                    <Checkbox
                      checked={item.showCard}
                      onClick={checked => this.onChangeCard(item.id, checked ? 0 : 1)}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </Box>
    );
  }

  render() {
    const { data, showCard, updateSource } = this.props;
    const { showTableControls, selectControlId, subFormProperties, isWorkflow } = this.state;

    return (
      <Fragment>
        {this.renderContent(data, showCard)}

        {showTableControls && (
          <Dialog
            visible
            title={_l('设置列权限')}
            onCancel={() => this.setState({ showTableControls: false })}
            onOk={() => {
              updateSource({
                formProperties: data.map(item => {
                  if (item.id === selectControlId) {
                    item.isWorkflow = isWorkflow;
                    item.subFormProperties = subFormProperties;
                  }

                  return item;
                }),
              });

              this.setState({ showTableControls: false });
            }}
          >
            <div className="Gray_9e">{_l('未开启时按照子表本身权限，开启后可配置审批节点中的列权限')}</div>
            <Switch
              className="mTop10"
              checked={isWorkflow}
              text={isWorkflow ? _l('开启') : _l('关闭')}
              onClick={() => this.setState({ isWorkflow: !isWorkflow })}
            />
            {isWorkflow && this.renderContent(subFormProperties)}
          </Dialog>
        )}
      </Fragment>
    );
  }
}
