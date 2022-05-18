import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, Input } from 'ming-ui';
import { H3 } from 'worksheet/components/Basics';
export default class AddConntrol extends React.Component {
  render() {
    const { defaultText, onOk, onClose } = this.props;
    return (
      <Dialog
        title={_l('新建文本字段')}
        width={480}
        visible
        anim={false}
        okText={_l('创建')}
        onCancel={onClose}
        onOk={() => {
          const value = this.input.value;
          if (!value.trim()) {
            alert(_l('请输入字段名称'), 3);
            return;
          }
          onOk(this.input.value.trim());
          onClose();
        }}
      >
        <H3 style={{ margin: '0 0 10px' }}>{_l('字段名称')}</H3>
        <Input
          defaultValue={defaultText}
          manualRef={input => {
            this.input = input;
            if (input) input.focus();
          }}
          style={{ width: '100%' }}
          placeholder={_l('字段名称')}
        />
      </Dialog>
    );
  }
}

AddConntrol.propTypes = {
  defaultText: PropTypes.string,
  onOk: PropTypes.func,
  onClose: PropTypes.func,
};
