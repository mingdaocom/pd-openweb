import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import { Checkbox, Dropdown, Form, Input, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import WidgetColor from 'src/pages/widgetConfig/widgetSetting/components/WidgetColor';
import { formatNumberFromInput } from 'src/utils/domain/control/number';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';

const AddLine = styled.div`
  color: var(--color-primary);
  &:hover {
    color: var(--color-link-hover);
  }
`;

const InputWrap = styled.div`
  &:hover {
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
    color: var(--color-link-hover) !important;
  }
`;

const DeleteWrap = styled.span`
  &:hover .icon {
    color: var(--color-link-hover) !important;
  }
`;

const ModalContent = styled(Form)`
  .lineStyle {
    width: 250px;
  }
  .percentValue {
    width: 160px;
  }
  .hap-checkbox-input {
    position: absolute !important;
  }
  .requiredItem .hap-form-item-label {
    margin-left: -10px;
  }
  .percentInput.hap-input-affix-wrapper {
    .hap-input {
      height: 34px !important;
    }
    .hap-input-suffix {
      border-left: none !important;
    }
  }
`;

const AUXILIARY_LINE_OK_BUTTON_PROPS = { htmlType: 'submit', form: 'auxiliaryLineForm' };

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.visible && !prevProps.visible) {
        this.setState({
          lineConfig: this.props.lineConfig,
        });
      }
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
        open={visible}
        centered={true}
        closeIcon={<Icon icon="close" className="Font20 pointer textTertiary" />}
        okText={_l('确认')}
        okButtonProps={AUXILIARY_LINE_OK_BUTTON_PROPS}
        onCancel={onCancel}
      >
        <ModalContent id="auxiliaryLineForm" layout="vertical" onFinish={this.handleSave}>
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
                      className="w100"
                      value={lineConfig.location}
                      suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                      options={[
                        {
                          value: 'left',
                          label: _l('左轴'),
                        },
                        {
                          value: 'right',
                          label: _l('右轴'),
                        },
                      ]}
                      onChange={value => {
                        this.handleChangeConfig({ location: value });
                      }}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          ) : (
            <div className="mBottom24 valignWrapper">
              <div className="flex">
                <div className="mBottom12">{_l('参考字段')}</div>
                <Select
                  className="w100"
                  value={
                    _.find(allYaxisList, { controlId: lineConfig.controlId }) ? (
                      lineConfig.controlId
                    ) : (
                      <span className="Red">{_l('当前字段已删除')}</span>
                    )
                  }
                  suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                  options={allYaxisList.map(item => ({
                    value: item.controlId,
                    label: item.controlName || <span className="Red">{_l('当前字段已删除')}</span>,
                  }))}
                  onChange={value => {
                    this.handleChangeConfig({ controlId: value });
                  }}
                />
              </div>
              {type === 'percentLine' && (
                <div className="mLeft10 percentValue">
                  <div className="mBottom12">{_l('百分位数')}</div>
                  <Input
                    className="percentInput"
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
                className="w100"
                value={lineConfig.style}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={[
                  {
                    value: 1,
                    label: _l('实线'),
                  },
                  {
                    value: 2,
                    label: _l('虚线'),
                  },
                  {
                    value: 3,
                    label: _l('点线'),
                  },
                ]}
                onChange={value => {
                  this.handleChangeConfig({ style: value });
                }}
              />
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
                onChange={event => {
                  this.handleChangeConfig({ showName: event.target.checked });
                }}
              >
                {_l('名称')}
              </Checkbox>
              <Checkbox
                checked={lineConfig.showValue}
                onChange={event => {
                  this.handleChangeConfig({ showValue: event.target.checked });
                }}
              >
                {_l('值')}
              </Checkbox>
            </div>
          )}
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
  getMenuItems = () => {
    const { yaxisList, displaySetup, reportType } = this.props.currentReport;
    const { isPile, isPerPile, isAccumulate } = displaySetup;
    const defaultConfig = {
      controlId: (yaxisList[0] || {}).controlId,
      color: '#1677ff',
      style: 1,
      showName: false,
      value: undefined,
    };

    return auxiliaryLineTypes
      .filter(item => {
        return isPile || isPerPile || isAccumulate ? item.type === 'constantLine' : true;
      })
      .filter(item => {
        if (reportTypes.RadarChart === reportType) {
          return !['averageLine', 'tendencyLine'].includes(item.type);
        }

        return true;
      })
      .map(item => ({
        key: item.type,
        className: 'pTop7 pBottom7 pLeft20',
        label: item.name,
        onClick: () => {
          this.setState({
            editLineConfig: {
              ...item,
              ...defaultConfig,
              showValue: item.type === 'tendencyLine' ? false : true,
              location: item.type === 'constantLine' ? 'left' : null,
              percent: item.type === 'percentLine' ? 50 : 0,
            },
          });
        },
      }));
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
              <Input readOnly value={item.name} className="flex mRight5" />
              <Icon
                className="textTertiary pointer"
                icon="edit"
                onClick={() => {
                  this.setState({ editLineConfig: item });
                }}
              />
            </InputWrap>
            <Tooltip title={_l('删除')}>
              <DeleteWrap>
                <Icon
                  className="textTertiary pointer Font19"
                  icon="trash"
                  onClick={() => {
                    this.handleRemoveLine(item.id);
                  }}
                />
              </DeleteWrap>
            </Tooltip>
          </div>
        ))}
        <Dropdown
          trigger={['click']}
          menu={{ items: this.getMenuItems() }}
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
