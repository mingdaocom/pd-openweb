import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import { ConfigProvider, Input, Modal, Button, Dropdown, Menu } from 'antd';
import { TagTextarea, Icon } from 'ming-ui';
import { isNumberControl, textNormTypes } from 'statistics/common';
import { normTypes } from '../../../enum';
import SelectControls from 'worksheet/common/WorkSheetFilter/components/SelectControls';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import _ from 'lodash';

const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  &.invalid {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    border-color: #f44336;
  }
`;

const calculateControlNormTypes = normTypes.map(item => {
  return {
    ...item,
    text: item.alias || item.text,
  };
});

const textControlNormTypes = textNormTypes.filter(n => n.value !== 7);

class CalculateControl extends Component {
  constructor(props) {
    super(props);
    const { editCalculateControl } = props;
    this.state = {
      controlName: editCalculateControl ? editCalculateControl.controlName : '',
      formulaStr: editCalculateControl ? editCalculateControl.dataSource : '',
      dot: editCalculateControl ? editCalculateControl.dot : 8,
      fnmatch: '',
      showInSideFormulaSelect: false,
      dropdownVisible: false,
      showDropdownId: '',
      showDropdownStyle: {},
    };
  }
  handleSave = () => {
    const { currentReport, editCalculateControl } = this.props;
    const { formulas, yaxisList } = currentReport;
    const { controlName, formulaStr, dot } = this.state;
    if (_.isEmpty(controlName)) {
      alert(_l('字段名称不能为空'), 2);
      return;
    }
    if (_.isEmpty(formulaStr)) {
      alert(_l('计算值不能为空'), 2);
      return;
    }
    if (editCalculateControl) {
      const newFormulas = formulas.map(item => {
        if (item.controlId === editCalculateControl.controlId) {
          return {
            ...item,
            controlName,
            dataSource: formulaStr,
            dot,
          };
        } else {
          return item;
        }
      });
      const param = {
        formulas: newFormulas,
      };
      if (_.find(yaxisList, { controlId: editCalculateControl.controlId })) {
        param.yaxisList = yaxisList.map(item => {
          if (item.controlId === editCalculateControl.controlId) {
            return {
              ...item,
              controlName,
              dot,
            };
          } else {
            return item;
          }
        });
      }
      this.props.onChangeCurrentReport(param, true);
    } else {
      const data = { controlId: uuidv4(), controlName: controlName, type: 10000001, dataSource: formulaStr, dot };
      this.props.onChangeCurrentReport({
        formulas: formulas.concat(data),
      });
    }
    this.props.onChangeDialogVisible(false);
  };
  handleChange = (err, value, obj) => {
    if (err) {
      // this.handleError(err);
      return;
    }
    const { fnmatch } = this.state;
    let newFnmatch = '';
    if (obj.origin === '+input') {
      if (!/[0-9|+|\-|*|/|(|),]/.test(obj.text[0])) {
        newFnmatch = fnmatch + obj.text[0];
      }
    }
    if (obj.origin === '+delete' && fnmatch && obj.removed[0]) {
      newFnmatch = /^[A-Z0-9]+$/.test(obj.removed[0]) ? fnmatch.replace(new RegExp(`${obj.removed[0]}$`), '') : '';
    }
    this.setState({
      formulaStr: value,
      fnmatch: newFnmatch,
      showInSideFormulaSelect: newFnmatch,
      fnmatchPos: newFnmatch ? this.tagtextarea.cmObj.getCursor() : undefined,
    });
  };
  handleChangeDot = value => {
    let count = '';
    if (value) {
      count = parseInt(value);
      count = isNaN(count) ? 0 : count;
      count = count > 8 ? 8 : count;
    } else {
      count = 0;
    }
    this.setState({ dot: count });
  };
  renderControlTypeOverlay({ controlId, type, enumDefault }, norm) {
    const isNumber = isNumberControl(type) || enumDefault === 1;
    return (
      <Menu className="chartMenu" style={{ width: 140 }}>
        {(isNumber ? calculateControlNormTypes : textControlNormTypes).map(item => (
          <Menu.Item
            key={item.value}
            style={{ color: norm.value === item.value ? '#2196f3' : null }}
            onClick={() => {
              const newFormulaStr = this.state.formulaStr.replace(
                new RegExp(`${controlId}-${norm.value || '\\d'}`),
                `${controlId}-${item.value}`,
              );
              this.tagtextarea.setValue(newFormulaStr);
              this.setState({ formulaStr: newFormulaStr, showDropdownId: '' });
            }}
          >
            {item.text}
          </Menu.Item>
        ))}
      </Menu>
    );
  }
  genControlTag = (axisControls, id) => {
    const control = _.find(axisControls, { controlId: id.replace(/-\w/, '') }) || {};
    const invalid = _.isEmpty(control);
    const type = id.replace(/\w+-/, '');
    const isNumber = isNumberControl(control.type) || control.enumDefault === 1;
    const norm = _.find(isNumber ? calculateControlNormTypes : textControlNormTypes, { value: Number(type) });
    return (
      <ControlTag className={cx('flexRow valignWrapper', { invalid })}>
        <span className="Font12">{invalid ? _l('字段已删除') : control.controlName}</span>
        {norm && (
          <span className="Font12 mLeft5" style={{ color: '#688ca7' }}>
            {norm.text}
          </span>
        )}
        {!norm && control.type === 11 && <span className="Font12 mLeft5 Red">{_l('计算方式失效，请重新调整')}</span>}
        {!invalid && <Icon className="Font14 mLeft5 pointer iconTrigger" icon="arrow-down-border" data-id={id} />}
      </ControlTag>
    );
  };
  renderDropdown() {
    const { showDropdownId, showDropdownStyle } = this.state;
    const control = _.find(this.props.axisControls, { controlId: showDropdownId.replace(/-\w/, '') }) || {};
    const invalid = _.isEmpty(control);
    const type = showDropdownId.replace(/\w+-/, '');
    const isNumber = isNumberControl(control.type) || control.enumDefault === 1;
    const norm = _.find(isNumber ? calculateControlNormTypes : textControlNormTypes, { value: Number(type) }) || {};
    if (showDropdownId) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={this.renderControlTypeOverlay(control, norm)}
          visible={showDropdownId}
          onVisibleChange={visible => {
            if (!visible) {
              this.setState({ showDropdownId: '' });
            }
          }}
        >
          <span className="Absolute" style={showDropdownStyle} />
        </Dropdown>
      );
    } else {
      return null;
    }
  }
  renderControlOverlay = () => {
    const { axisControls } = this.props;
    const allControls = axisControls.map(n => {
      if (n.type === 10000000) {
        return {
          ...n,
          type: 6,
        };
      }
      return n;
    });
    return (
      <SelectControls
        controls={allControls}
        onAdd={control => {
          this.tagtextarea.insertColumnTag(`${control.controlId}-${isNumberControl(control.type) ? 1 : 5}`);
          this.setState({ dropdownVisible: false });
        }}
        onClose={() => {
          this.setState({ dropdownVisible: false });
        }}
      />
    );
  };
  handleOpenDropdown = ({ target }) => {
    if (target.classList.contains('iconTrigger')) {
      const rect = target.getBoundingClientRect();
      const chartModalRect = document.querySelector('.chartModal').getBoundingClientRect();
      this.setState({
        showDropdownId: target.dataset.id,
        showDropdownStyle: { left: rect.left - chartModalRect.left, top: rect.top - chartModalRect.top + 20 },
      });
    }
  };
  render() {
    const { axisControls } = this.props;
    const { controlName, showInSideFormulaSelect, formulaStr, dot, dropdownVisible } = this.state;
    return (
      <div>
        <div className="mBottom10">{_l('名称')}</div>
        <Input
          value={controlName}
          className="chartInput"
          placeholder={_l('输入字段名称')}
          onChange={e => {
            this.setState({
              controlName: e.target.value,
            });
          }}
        />
        <div className="flexRow valignWrapper mTop16 mBottom10">
          <div className="flex Font14">{_l('计算')}</div>
          <Trigger
            action={['click']}
            popupVisible={dropdownVisible}
            onPopupVisibleChange={dropdownVisible => this.setState({ dropdownVisible })}
            popup={this.renderControlOverlay()}
            popupAlign={{
              points: ['tl', 'bl'],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            <div className="flexRow valignWrapper pointer" style={{ color: '#2196F3' }}>
              <Icon className="Font20" icon="add" />
              <span className="Font13">{_l('选择字段')}</span>
            </div>
          </Trigger>
        </div>
        <div onClick={this.handleOpenDropdown}>
          <TagTextarea
            mode={2}
            defaultValue={formulaStr}
            maxHeight={240}
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(id, options) => this.genControlTag(axisControls, id)}
            onChange={this.handleChange}
          />
          {this.renderDropdown()}
        </div>
        <div className="mTop8 Font12 Gray_75">
          {_l('英文输入+、-、*、/、( ) 进行运算，支持输入数值或全数值的计算，不支持公式')}
        </div>
        <div className="mTop16 mBottom10">{_l('保留小数位数')}</div>
        <Input
          style={{ width: 100 }}
          className="chartInput"
          value={dot}
          onChange={event => {
            this.handleChangeDot(event.target.value);
          }}
          suffix={
            <div className="flexColumn">
              <Icon
                icon="expand_less"
                className="Gray_9e Font20 pointer mBottom2"
                onClick={() => {
                  let newYdot = Number(dot);
                  this.handleChangeDot(newYdot + 1);
                }}
              />
              <Icon
                icon="expand_more"
                className="Gray_9e Font20 pointer mTop2"
                onClick={() => {
                  let newYdot = Number(dot);
                  this.handleChangeDot(newYdot ? newYdot - 1 : 0);
                }}
              />
            </div>
          }
        />
      </div>
    );
  }
}

export default class CalculateControlModal extends Component {
  constructor(props) {
    super(props);
  }
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.props.onChangeDialogVisible(false);
            }}
          >
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.calculateControlEl.handleSave();
            }}
          >
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { dialogVisible } = this.props;
    return (
      <Modal
        title={_l('添加计算字段')}
        width={480}
        className="chartModal"
        visible={dialogVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={() => {
          this.props.onChangeDialogVisible(false);
        }}
      >
        <CalculateControl
          ref={el => {
            this.calculateControlEl = el;
          }}
          {...this.props}
        />
      </Modal>
    );
  }
}
