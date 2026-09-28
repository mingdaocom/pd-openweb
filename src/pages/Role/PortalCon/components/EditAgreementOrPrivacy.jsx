import React from 'react';
import { RichText } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';

const AGREEMENT_MODAL_STYLES = {
  body: { margin: '0 -24px' },
};

export default function EditAgreementOrPrivacy(props) {
  const { onChange, setShow } = props;

  return (
    <Modal
      title={props.type === 0 ? _l('用户协议') : _l('隐私政策')}
      styles={AGREEMENT_MODAL_STYLES}
      width={800}
      mask={{ closable: true }}
      keyboard
      onCancel={setShow}
      open={props.show}
    >
      <RichText
        minHeight={600}
        showTool={true}
        className="mdEditorContent"
        data={props.data || ''}
        onActualSave={value => onChange(value)}
      />
    </Modal>
  );
}
