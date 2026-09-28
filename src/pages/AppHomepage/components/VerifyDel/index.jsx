import React, { Component } from 'react';
import _ from 'lodash';
import { func, string } from 'prop-types';
import { Input, Modal } from 'ming-ui/antd-components';
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
    const { value, delObj = {} } = this.state;
    const currentName = (mode ? delObj.name : name) || '';
    const isCanDel = value.trim() === currentName.trim();
    return (
      <Modal
        width={560}
        open
        mask={{ closable: true }}
        keyboard
        className="verifyDelDialog"
        title={<span className="textError">{_l('删除应用 “%0”', currentName)}</span>}
        okText={cancelText}
        okButtonProps={{ danger: true }}
        okDisabled={!isCanDel}
        onOk={() => onOk(mode ? delObj : '')}
        onCancel={onCancel}
      >
        <div className="verifyContent">
          <div className="hint">
            <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
              {_l('注意：应用下所有配置与数据(包括聚合表)将被删除，删除后可在工作台首页回收站恢复。')}
            </span>
            <div>{_l('请确认所有应用成员都不再需要此应用后，再执行此操作')}</div>
          </div>
          <div className="inputVerify">
            <p>{_l('请输入应用名称，表示您确认删除此应用')}</p>
            <Input value={value} onChange={event => this.setState({ value: event.target.value })} />
          </div>
          {/* <Checkbox text={_l('我确认执行此操作')} className="verifyCheckbox" checked={isDelChecked} onClick={() => this.toggleChecked()} /> */}
        </div>
      </Modal>
    );
  }
}
