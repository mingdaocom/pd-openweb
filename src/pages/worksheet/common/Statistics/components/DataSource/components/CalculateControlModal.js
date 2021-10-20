import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import { ConfigProvider, Input, Modal, Button, Dropdown, Menu } from 'antd';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import { TagTextarea, Icon } from 'ming-ui';
import { isNumberControl, normTypes } from 'src/pages/worksheet/common/Statistics/common';
import styled from 'styled-components';

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

const calculateControlNormTypes = _.cloneDeep(normTypes).map(item => {
  return {
    ...item,
    text: item.alias || item.text,
  };
});

class CalculateControl extends Component {
  constructor(props) {
    super(props);
    const { editCalculateControl } = props;
    this.state = {
      controlName: editCalculateControl ? editCalculateControl.controlName : '',
      formulaStr: editCalculateControl ? editCalculateControl.dataSource : '',
      fnmatch: '',
      showInSideFormulaSelect: false,
    };
  }
  handleSave = () => {
    const { currentReport, editCalculateControl } = this.props;
    const { formulas, yaxisList } = currentReport;
    const { controlName, formulaStr } = this.state;
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
            };
          } else {
            return item;
          }
        });
      }
      this.props.onChangeCurrentReport(param, true);
    } else {
      const data = { controlId: uuidv4(), controlName: controlName, type: 10000001, dataSource: formulaStr, dot: 2 };
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
  renderControlTypeOverlay(controlId, norm) {
    return (
      <Menu className="chartMenu" style={{ width: 140 }}>
        {calculateControlNormTypes.map(item => (
          <Menu.Item
            key={item.value}
            style={{ color: norm.value === item.value ? '#2196f3' : null }}
            onClick={() => {
              const newFormulaStr = this.state.formulaStr.replace(
                new RegExp(`${controlId}-\\w`),
                `${controlId}-${item.value}`,
              );
              this.tagtextarea.setValue(newFormulaStr);
              this.setState({ formulaStr: newFormulaStr });
            }}
          >
            {item.text}
          </Menu.Item>
        ))}
      </Menu>
    );
  }
  genControlTag(allControls, id) {
    const control = _.find(allControls, { controlId: id.replace(/-\w/, '') });
    const invalid = _.isEmpty(control);
    const type = id.replace(/\w+-/, '');
    const norm = _.find(calculateControlNormTypes, { value: Number(type) });
    return (
      <ControlTag className={cx('flexRow valignWrapper', { invalid })}>
        <span className="Font12">{invalid ? _l('字段已删除') : control.controlName}</span>
        {norm && (
          <span className="Font12 mLeft5" style={{ color: '#688ca7' }}>
            {norm.text}
          </span>
        )}
        {!invalid && (
          <Dropdown trigger={['click']} overlay={this.renderControlTypeOverlay(control.controlId, norm)}>
            <Icon className="Font14 mLeft5 pointer" icon="arrow-down-border" />
          </Dropdown>
        )}
      </ControlTag>
    );
  }
  renderControlOverlay = () => {
    const { axisControls } = this.props;
    const numberControls = axisControls.filter(item => isNumberControl(item.type));
    return (
      <Menu
        className="chartMenu"
        style={{ minWidth: 130, maxHeight: 300, overflowY: 'auto', backgroundClip: 'border-box' }}
      >
        {numberControls.map(item => (
          <Menu.Item
            key={item.controlId}
            onClick={() => {
              this.tagtextarea.insertColumnTag(`${item.controlId}-${1}`);
            }}
          >
            {item.controlName}
          </Menu.Item>
        ))}
      </Menu>
    );
  };
  render() {
    const { axisControls } = this.props;
    const { controlName, showInSideFormulaSelect, formulaStr } = this.state;
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
          <Dropdown trigger={['click']} placement="bottomRight" overlay={this.renderControlOverlay()}>
            <div className="flexRow valignWrapper pointer" style={{ color: '#2196F3' }}>
              <Icon className="Font20" icon="add" />
              <span className="Font13">{_l('选择字段')}</span>
            </div>
          </Dropdown>
        </div>
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
        <div className="mTop8 Font12 Gray_75">
          {_l('英文输入+、-、*、/、( ) 进行运算，支持输入数值或全数值的计算，不支持公式')}
        </div>
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
      <div className="mTop15 mBottom20 pRight8">
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
