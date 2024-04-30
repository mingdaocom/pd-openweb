import React, { Component } from 'react';
import WidgetConfig from 'src/pages/widgetConfig';
import { FunctionWrap, Dialog } from 'ming-ui';
import './index.less';

class DialogWidgetConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  handleClose = () => {
    this.setState({ visible: false });
    this.props.onClose && this.props.onClose();
  };

  render() {
    const { visible } = this.state;
    const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
    return (
      <Dialog
        width={width}
        className="DialogWidgetConfig"
        overlayClosable={false}
        visible={visible}
        title={null}
        footer={null}
        type="fixed"
      >
        <WidgetConfig {...this.props} handleClose={() => this.handleClose()} />
      </Dialog>
    );
  }
}

export default function dialogEditWorksheet(props) {
  FunctionWrap(DialogWidgetConfig, { ...props });
}
