import React, { Component } from 'react';
import { func, string } from 'prop-types';
import cx from 'classnames';
import { Dialog, Checkbox, Input } from 'ming-ui';
import './index.less';

export default class VerifyDel extends Component {
  static propTypes = {
    name: string,
    onOk: func,
    onCancel: func,
    cancelText: string,
  };
  static defaultProps = {
    onOk: _.noop,
    onCancel: _.noop,
    cancelText: _l('删除应用'),
    name: '',
  };
  constructor(props) {
    super(props);
  }
  state = {
    isDelChecked: false,
    value: '',
    delObj: {},
  };
  componentDidMount() {
    const { para = {}, mode } = this.props;
    if (mode) {
      this.setState({
        delObj: para,
      });
    }
  }
  toggleChecked = () => {
    this.setState({
      isDelChecked: !this.state.isDelChecked,
    });
  };
  render() {
    const { onOk, onCancel, cancelText, name, mode } = this.props;
    const { isDelChecked, value, delObj = {} } = this.state;
    const currentName = (mode ? delObj.name : name) || '';
    const isCanDel = value.trim() === currentName.trim();
    return (
      <Dialog
        style={{ width: '560px' }}
        visible
        className="verifyDelDialog"
        visible
        title={null}
        footer={null}
        onCancel={onCancel}
      >
        <div className="verifyContent">
          <div className="title">
            <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
            {_l('删除应用 “%0”', currentName)}
          </div>
          <div className="hint">
            <span style={{ color: '#333', fontWeight: 'bold' }}>{_l('注意：应用下所有配置和数据将被删除。')}</span>
            {_l('请确认所有应用成员都不再需要此应用后，再执行此操作')}
          </div>
          <div className="inputVerify">
            <p>{_l('请输入应用名称，表示您确认删除此应用')}</p>
            <Input value={value} onChange={value => this.setState({ value })} />
          </div>
          {/* <Checkbox text={_l('我确认执行此操作')} className="verifyCheckbox" checked={isDelChecked} onClick={() => this.toggleChecked()} /> */}
          <div className="btnBox">
            <button className="btnCancel" onClick={onCancel}>
              {_l('取消')}
            </button>
            <button
              onClick={() => onOk(mode ? delObj : '')}
              disabled={!isCanDel}
              className={cx('btnOk', { btnDel: isCanDel })}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}
