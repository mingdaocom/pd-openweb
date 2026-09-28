import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Input, Modal, Radio } from 'ming-ui/antd-components';
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
      <Modal
        className="saveWorksheetFilter workSheetForm"
        open={visible}
        title={title || _l('保存筛选器')}
        width={480}
        onCancel={onClose}
        okText={_l('保存')}
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
                onChange={event => {
                  this.setState({ filterName: event.target.value });
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
              <Radio.Group
                options={[
                  { text: _l('个人'), value: 1 },
                  { text: _l('公共'), value: 2, disabled: !isCharge },
                ].map(({ text, ...option }) => ({ ...option, label: text }))}
                value={filterType}
                onChange={event => {
                  const value = event.target.value;

                  this.setState({
                    filterType: value,
                  });
                }}
                size="small"
              />
            </div>
          </div>
        )}
      </Modal>
    );
  }
}
