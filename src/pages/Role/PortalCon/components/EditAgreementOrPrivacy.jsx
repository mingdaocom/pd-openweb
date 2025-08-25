import React from 'react';
import { Dialog, RichText } from 'ming-ui';
import './editAgreementOrPrivacy.less';

export default function EditAgreementOrPrivacy(props) {
  const { onChange, setShow } = props;

  return (
    <Dialog
      title={props.type === 0 ? _l('用户协议') : _l('隐私政策')}
      bodyClass="EditAgreementOrPrivacy"
      width={800}
      onCancel={setShow}
      footer={''}
      visible={props.show}
    >
      <RichText
        minHeight={600}
        showTool={true}
        className="mdEditorContent"
        data={props.data || ''}
        onActualSave={value => onChange(value)}
      />
    </Dialog>
  );
}
