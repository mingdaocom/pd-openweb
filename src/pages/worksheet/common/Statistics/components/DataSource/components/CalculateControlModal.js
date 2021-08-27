import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConfigProvider, Input, Modal, Button, Dropdown, Menu } from 'antd';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import { TagTextarea, Icon } from 'ming-ui';
import { genControlTag } from 'src/pages/widgetConfig/util/data';
import { isNumberControl } from 'src/pages/worksheet/common/Statistics/common';

export default class SheetModal extends Component {
  constructor(props) {
    super(props);
    const dataSource = '';
    this.state = {
      controlName: '',
      calType: 1,
      fnmatch: '',
      showInSideFormulaSelect: false,
      selectColumnVisible: false
    }
    this.state.formulaStr = this.getFormulaFromDataSource(this.state.calType, dataSource);
  }
  getFormulaFromDataSource(calType, dataSource) {
    if (calType === 1) {
      return dataSource;
    } else {
      return dataSource
        ? getRePosFromStr(dataSource)
            .map(s => `$${s.tag}$`)
            .join('')
        : '';
    }
  }
  handleSave = () => {
    const { formulas } = this.props.currentReport;
    const { controlName, formulaStr } = this.state;
    if (_.isEmpty(controlName)) {
      alert(_l('字段名称不能为空'), 2);
      return
    }
    if (_.isEmpty(formulaStr)) {
      alert(_l('计算值不能为空'), 2);
      return
    }
    const data = { controlId: uuidv4(), controlName: controlName, type: 10000001, dataSource: formulaStr };
    this.props.onChangeCurrentReport({
      formulas: formulas.concat(data)
    });
    this.props.onChangeDialogVisible(false);
  }
  handleChange = (err, value, obj) => {
    if (err) {
      // this.handleError(err);
      return;
    }
    const { fnmatch, calType } = this.state;
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
      selectColumnVisible: !newFnmatch,
      fnmatchPos: newFnmatch ? this.tagtextarea.cmObj.getCursor() : undefined,
    });
  }
  renderOverlay = () => {
    const { axisControls } = this.props;
    const numberControls = axisControls.filter(item => isNumberControl(item.type));
    return (
      <Menu className="chartMenu">
        {
          numberControls.map(item => (
            <Menu.Item
              key={item.controlId}
              onClick={() => {
                this.tagtextarea.insertColumnTag(item.controlId);
              }}
            >
              {item.controlName}
            </Menu.Item>
          ))
        }
      </Menu>
    );
  }
  renderContent() {
    const { axisControls } = this.props;
    const { controlName, selectColumnVisible, showInSideFormulaSelect, fnmatch } = this.state;
    const formulaValue = '';
    return (
      <div>
        <div className="mBottom10">{_l('字段名称')}</div>
        <Input
          value={controlName}
          className="chartInput"
          placeholder={_l('输入字段名称')}
          onChange={(e) => {
            this.setState({
              controlName: e.target.value
            });
          }}
        />
        <div className="mTop16 mBottom10">{_l('计算')}</div>
        <Dropdown
          trigger={['click']}
          overlay={this.renderOverlay()}
          visible={selectColumnVisible}
          onVisibleChange={visible => {
            this.setState({ selectColumnVisible: visible });
          }}
        >
          <TagTextarea
            mode={2}
            defaultValue={formulaValue}
            maxHeight={140}
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(id, options) => genControlTag(axisControls, id)}
            onChange={this.handleChange}
            onFocus={() => {
              this.setState({ selectColumnVisible: true });
            }}
          />
        </Dropdown>
        <div className="mTop8">{_l('英文输入+、-、*、/、( ) 进行运算，不支持公式')}</div>
      </div>
    );
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
          <Button type="primary" onClick={this.handleSave}>
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
        {this.renderContent()}
      </Modal>
    );
  }
}
