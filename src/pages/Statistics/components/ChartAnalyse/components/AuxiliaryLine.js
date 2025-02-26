import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Input, ConfigProvider, Button, Modal, Select, Checkbox, Form } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { formatNumberFromInput } from 'src/util';
import { reportTypes } from 'statistics/Charts/common';
import WidgetColor from 'src/pages/widgetConfig/widgetSetting/components/WidgetColor';
import _ from 'lodash';

const AddLine = styled.div`
  color: #2196f3;
  &:hover {
    color: #0484fb;
  }
`;

const InputWrap = styled.div`
  &:hover {
    .ant-input {
      background-color: #f5f5f5 !important;
    }
    .icon-edit {
      display: block;
    }
  }
  input {
    padding: 7px 11px;
  }
  .icon-edit {
    display: none;
    position: absolute;
    right: 15px;
    top: 10px;
    color: #1890ff !important;
  }
`;

const DeleteWrap = styled.span`
  &:hover .icon {
    color: #1890ff !important;
  }
`;

const ModalContent = styled(Form)`
  .lineStyle {
    width: 250px;
  }
  .percentValue {
    width: 160px;
  }
  .ant-checkbox-input {
    position: absolute !important;
  }
  .requiredItem .ant-form-item-label {
    margin-left: -10px;
  }
  .percentInput.ant-input-affix-wrapper {
    .ant-input {
      height: 34px !important;
    }
    .ant-input-suffix {
      border-left: none !important;
    }
  }
  .footer {
    align-items: center;
    justify-content: flex-end;
  }
`;

const auxiliaryLineTypes = [
  {
    name: _l('恒定线'),
    type: 'constantLine',
  },
  {
    name: _l('最小值线'),
    type: 'minLine',
  },
  {
    name: _l('最大值线'),
    type: 'maxLine',
  },
  {
    name: _l('平均线'),
    type: 'averageLine',
  },
  {
    name: _l('中值线'),
    type: 'medianLine',
  },
  {
    name: _l('百分位数线'),
    type: 'percentLine',
  },
  {
    name: _l('趋势线'),
    type: 'tendencyLine',
  },
];

class LineConfigModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineConfig: {},
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.setState({
        lineConfig: nextProps.lineConfig,
      });
    }
  }
  handleSave = () => {
    const { lineConfig } = this.state;
    this.props.onSave(lineConfig);
    this.props.onCancel();
  };
  handleChangeConfig = data => {
    const { lineConfig } = this.state;
    this.setState({
      lineConfig: {
        ...lineConfig,
        ...data,
      },
    });
  };
  renderFooter() {
    const { onCancel } = this.props;
    return (
      <div className="mTop32 mBottom20 footer flexRow">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" htmlType="submit">
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { lineConfig } = this.state;
    const { visible, onCancel, yaxisList, rightYaxisList, reportType } = this.props;
    const { type } = lineConfig;
    const allYaxisList = _.uniqBy(yaxisList.concat(rightYaxisList), 'controlId');

    return (
      <Modal
        title={type && _.find(auxiliaryLineTypes, { type }).name}
        width={580}
        className="chartModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={null}
        onCancel={onCancel}
      >
        <ModalContent layout="vertical" onFinish={this.handleSave}>
          <Form.Item
            initialValue={lineConfig.name}
            label={_l('名称')}
            className="requiredItem"
            name="name"
            rules={[
              { required: true, message: _l('请输入名称') },
              { max: 12, message: _l('名称字符数量不能超过 12 个') },
            ]}
          >
            <Input
              className="chartInput"
              onChange={e => {
                this.handleChangeConfig({ name: e.target.value });
              }}
            />
          </Form.Item>
          {type === 'constantLine' ? (
            <div className="valignWrapper">
              <div className="flex">
                <Form.Item
                  initialValue={lineConfig.value}
                  label={_l('固定值')}
                  className="requiredItem"
                  name="value"
                  rules={[{ required: true, message: _l('请输入固定值') }]}
                >
                  <Input
                    className="chartInput"
                    placeholder={_l('请输入数值')}
                    onChange={e => {
                      const value = formatNumberFromInput(e.target.value);
                      this.handleChangeConfig({ value: Number(value) });
                    }}
                  />
                </Form.Item>
              </div>
              {reportTypes.DualAxes === reportType && (
                <div className="flex mLeft10">
                  <Form.Item label={_l('位置')}>
                    <Select
                      className="chartSelect w100"
                      value={lineConfig.location}
                      suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                      onChange={value => {
                        this.handleChangeConfig({ location: value });
                      }}
                    >
                      <Select.Option className="selectOptionWrapper" value={'left'}>
                        {_l('左轴')}
                      </Select.Option>
                      <Select.Option className="selectOptionWrapper" value={'right'}>
                        {_l('右轴')}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              )}
            </div>
          ) : (
            <div className="mBottom24 valignWrapper">
              <div className="flex">
                <div className="mBottom12">{_l('参考字段')}</div>
                <Select
                  className="chartSelect w100"
                  value={
                    _.find(allYaxisList, { controlId: lineConfig.controlId }) ? (
                      lineConfig.controlId
                    ) : (
                      <span className="Red">{_l('当前字段已删除')}</span>
                    )
                  }
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  onChange={value => {
                    this.handleChangeConfig({ controlId: value });
                  }}
                >
                  {allYaxisList.map(item => (
                    <Select.Option className="selectOptionWrapper" value={item.controlId}>
                      {item.controlName || <span className="Red">{_l('当前字段已删除')}</span>}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {type === 'percentLine' && (
                <div className="mLeft10 percentValue">
                  <div className="mBottom12">{_l('百分位数')}</div>
                  <Input
                    className="chartInput percentInput"
                    value={lineConfig.percent}
                    suffix="%"
                    onChange={e => {
                      const { value } = e.target;
                      let count = parseInt(value);
                      count = isNaN(count) ? 0 : count;
                      count = count >= 100 ? 100 : count;
                      this.handleChangeConfig({ percent: count });
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <div className="mBottom24 valignWrapper">
            <div className="lineStyle flex mRight10">
              <div className="mBottom12">{_l('线条样式')}</div>
              <Select
                className="chartSelect w100"
                value={lineConfig.style}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  this.handleChangeConfig({ style: value });
                }}
              >
                <Select.Option className="selectOptionWrapper" value={1}>
                  {_l('实线')}
                </Select.Option>
                <Select.Option className="selectOptionWrapper" value={2}>
                  {_l('虚线')}
                </Select.Option>
                <Select.Option className="selectOptionWrapper" value={3}>
                  {_l('点线')}
                </Select.Option>
              </Select>
            </div>
            {type !== 'tendencyLine' && (
              <div className="flex">
                <div className="mBottom12">{_l('颜色')}</div>
                <div className="valignWrapper">
                  <WidgetColor
                    color={lineConfig.color}
                    handleChange={color => {
                      this.handleChangeConfig({ color });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {type !== 'tendencyLine' && (
            <div className="mBottom24">
              <div className="mBottom12">{_l('显示内容')}</div>
              <Checkbox
                className="mRight10"
                checked={lineConfig.showName}
                onChange={e => {
                  this.handleChangeConfig({ showName: event.target.checked });
                }}
              >
                {_l('名称')}
              </Checkbox>
              <Checkbox
                checked={lineConfig.showValue}
                onChange={e => {
                  this.handleChangeConfig({ showValue: event.target.checked });
                }}
              >
                {_l('值')}
              </Checkbox>
            </div>
          )}
          {this.renderFooter()}
        </ModalContent>
      </Modal>
    );
  }
}

export default class AuxiliaryLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editLineConfig: null,
    };
  }
  handleAddLine = data => {
    const { displaySetup } = this.props.currentReport;
    const { auxiliaryLines } = displaySetup;

    if (data.id) {
      this.props.onChangeDisplaySetup({
        auxiliaryLines: auxiliaryLines.map(item => {
          if (item.id === data.id) {
            return data;
          } else {
            return item;
          }
        }),
      });
    } else {
      const line = {
        ...data,
        id: uuidv4(),
      };
      this.props.onChangeDisplaySetup({
        auxiliaryLines: auxiliaryLines.concat(line),
      });
    }
  };
  handleRemoveLine = id => {
    const { displaySetup } = this.props.currentReport;
    const { auxiliaryLines } = displaySetup;
    this.props.onChangeDisplaySetup({
      auxiliaryLines: auxiliaryLines.filter(l => l.id !== id),
    });
  };
  renderMenu = () => {
    const { yaxisList, displaySetup } = this.props.currentReport;
    const { isPile, isPerPile, isAccumulate } = displaySetup;
    const defaultConfig = {
      controlId: (yaxisList[0] || {}).controlId,
      color: '#2196F3',
      style: 1,
      showName: false,
      value: undefined,
    };
    return (
      <Menu>
        {auxiliaryLineTypes
          .filter(item => {
            return isPile || isPerPile || isAccumulate ? item.type === 'constantLine' : true;
          })
          .map(item => (
            <Menu.Item
              key={item.type}
              className="pTop7 pBottom7 pLeft20"
              onClick={() => {
                this.setState({
                  editLineConfig: {
                    ...item,
                    ...defaultConfig,
                    showValue: item.type === 'tendencyLine' ? false : true,
                    location: item.type === 'constantLine' ? 'left' : null,
                    percent: item.type === 'percentLine' ? 50 : 0,
                  },
                });
              }}
            >
              {item.name}
            </Menu.Item>
          ))}
      </Menu>
    );
  };
  render() {
    const { currentReport } = this.props;
    const { displaySetup, yaxisList, rightY, reportType } = currentReport;
    const rightYaxisList = _.get(rightY, ['yaxisList']);
    const { auxiliaryLines } = displaySetup;
    const { editLineConfig } = this.state;
    return (
      <div className="mBottom16">
        {auxiliaryLines.map(item => (
          <div className="valignWrapper flex mBottom12" key={item.id}>
            <InputWrap className="valignWrapper w100 Relative">
              <Input readOnly value={item.name} className="chartInput flex mRight5" />
              <Icon
                className="Gray_9e pointer"
                icon="edit"
                onClick={() => {
                  this.setState({ editLineConfig: item });
                }}
              />
            </InputWrap>
            <DeleteWrap data-tip={_l('删除')}>
              <Icon
                className="Gray_9e pointer Font19"
                icon="task-new-delete"
                onClick={() => {
                  this.handleRemoveLine(item.id);
                }}
              />
            </DeleteWrap>
          </div>
        ))}
        <Dropdown
          trigger={['click']}
          overlay={this.renderMenu}
          getPopupContainer={() => document.querySelector('.ChartDialogSetting .chartTabs')}
        >
          <AddLine className="Font13 valignWrapper pointer" onClick={e => e.preventDefault()}>
            <Icon icon="add" />
            {_l('添加辅助线')}
          </AddLine>
        </Dropdown>
        <LineConfigModal
          visible={!!editLineConfig}
          lineConfig={editLineConfig || {}}
          yaxisList={yaxisList}
          rightYaxisList={rightYaxisList || []}
          reportType={reportType}
          onSave={this.handleAddLine}
          onCancel={() => {
            this.setState({ editLineConfig: null });
          }}
        />
      </div>
    );
  }
}
