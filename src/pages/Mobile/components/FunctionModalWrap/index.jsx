import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal, WingBlank, Button } from 'antd-mobile';

class ModalWrap extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { visible, onClose } = this.props;
    return (
      <Modal popup visible={visible} onClose={onClose} animationType="slide-up" className="h100">
        <div className="flexColumn h100">
          <div className="flex">content</div>
          <div className="btnsWrapper valignWrapper flexRow">
            <WingBlank className="flex" size="sm">
              <Button className="Font12 Gray_75 bold" onClick={onClose}>
                {_l('自由输入')}
              </Button>
            </WingBlank>
          </div>
        </div>
      </Modal>
    );
  }
}

export default function functionModalWrap(props) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  function destory() {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
  ReactDOM.render(<ModalWrap visible {...props} onClose={destory} />, div);
}
