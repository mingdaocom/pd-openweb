import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Input, RadioGroup } from 'ming-ui';
import './SaveWorksheetFilter.less';

export default class SaveWorksheetFilter extends Component {
  static propTypes = {
    title: PropTypes.string,
    visible: PropTypes.bool,
    isCharge: PropTypes.bool,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    filterName: PropTypes.string,
    filterType: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      filterName: props.filterName || _l('自定义筛选'),
      filterType: props.filterType || 1,
    };
  }
  componentDidMount() {
    if (this.form) {
      this.form.querySelector('.sheetName').focus();
    }
  }
  render() {
    const { title, visible, isCharge, onClose, onSave } = this.props;
    const { filterName, filterType } = this.state;
    return (
      <Dialog
        className="saveWorksheetFilter workSheetForm"
        visible={visible}
        anim={false}
        title={title || _l('保存筛选器')}
        width={480}
        onCancel={onClose}
        onText={_l('保存')}
        onOk={() => {
          if (!_.trim(filterName)) {
            alert(_l('请输入筛选器名称'), 3);
            return;
          }
          onSave({ filterName, filterType });
          onClose();
        }}
      >
        <div className="formItem flexRow" ref={form => (this.form = form)}>
          <div className="label">{_l('名称')}</div>
          <div className="content">
            <div className="flex content">
              <Input
                className="sheetName w100"
                value={filterName}
                onChange={value => {
                  this.setState({ filterName: value });
                }}
              />
            </div>
          </div>
        </div>
        {/* 外部门户没有公共筛选 */}
        {!md.global.Account.isPortal && (
          <div className="formItem flexRow">
            <div className="label">{_l('使用范围')}</div>
            <div className="content">
              <RadioGroup
                data={[
                  { text: _l('个人'), value: 1 },
                  { text: _l('公共'), value: 2, disabled: !isCharge },
                ]}
                checkedValue={filterType}
                onChange={value => {
                  this.setState({ filterType: value });
                }}
                size="small"
              />
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}
