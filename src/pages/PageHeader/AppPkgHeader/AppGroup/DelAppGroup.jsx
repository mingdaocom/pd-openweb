import React, { Component } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import { Icon, Dialog, Dropdown, Button } from 'ming-ui';

export default class DelAppGroup extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    sourceAppSectionId: '',
  };
  render() {
    const { onOk, onCancel, data } = this.props;
    const { sourceAppSectionId } = this.state;
    return (
      <Dialog className="delAppItemDialog" confirm="danger" title={_l('删除分组')} visible footer={null} onCancel={onCancel}>
        <div className="explain">{_l('当前分组下包含工作表,必须将他们移到其他分组后再进行删除')}</div>
        <div className="moveTo">
          <span>{_l('移动到')}</span>
          <Dropdown
            isAppendToBody
            className="delAppItemDropdown"
            data={data}
            onChange={id => {
              this.setState({ sourceAppSectionId: id });
            }}
          />
        </div>
        <div className="btnBox">
          <button className="btnCancel" onClick={onCancel}>
            {_l('取消')}
          </button>
          <button onClick={() => onOk(sourceAppSectionId)} disabled={!sourceAppSectionId} className={cx('btnOk', { btnDel: !!sourceAppSectionId })}>
            {_l('删除')}
          </button>
        </div>
      </Dialog>
    );
  }
}
