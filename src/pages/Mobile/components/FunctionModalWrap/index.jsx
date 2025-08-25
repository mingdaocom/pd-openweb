import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Popup } from 'antd-mobile';

class ModalWrap extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { visible, onClose } = this.props;
    return (
      <Popup visible={visible} onClose={onClose} className="mobileModal full">
        <div className="flexColumn h100">
          <div className="flex">content</div>
          <div className="btnsWrapper valignWrapper flexRow">
            <div className="flex mLeft6 mRight6">
              <Button className="Font12 Gray_75 bold" onClick={onClose}>
                {_l('自由输入')}
              </Button>
            </div>
          </div>
        </div>
      </Popup>
    );
  }
}

export default function functionModalWrap(props) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);

  function destory() {
    root.unmount();
    document.body.removeChild(div);
  }

  root.render(<ModalWrap visible {...props} onClose={destory} />);
}
