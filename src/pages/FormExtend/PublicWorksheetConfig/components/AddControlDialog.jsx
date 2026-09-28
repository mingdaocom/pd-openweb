import React from 'react';
import PropTypes from 'prop-types';
import { Input, Modal } from 'ming-ui/antd-components';
import { H3 } from 'worksheet/components/Basics';

export default class AddConntrol extends React.Component {
  render() {
    const { defaultText, onOk, onClose } = this.props;
    return (
      <Modal
        title={_l('新建文本字段')}
        width={480}
        open
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
          ref={input => {
            this.input = input?.input;
            if (this.input) this.input.focus();
          }}
          style={{ width: '100%' }}
          placeholder={_l('字段名称')}
        />
      </Modal>
    );
  }
}

AddConntrol.propTypes = {
  defaultText: PropTypes.string,
  onOk: PropTypes.func,
  onClose: PropTypes.func,
};
