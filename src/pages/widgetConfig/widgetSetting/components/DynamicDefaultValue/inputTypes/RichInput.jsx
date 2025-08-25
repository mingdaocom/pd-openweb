import React, { createRef, useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Icon, RichText } from 'ming-ui';
import EditIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState(staticValue);
  const [isDynamic, setDynamic] = useState(!!cid);
  const [visible, setVisible] = useState(false);
  const $wrap = createRef(null);

  useEffect(() => {
    setValue(staticValue);
    setDynamic(!!cid);
  }, [data.controlId, cid, staticValue]);

  const setDynamicValue = newValue => {
    const filterStatic = dynamicValue.filter(i => !i.staticValue);
    onDynamicValueChange(filterStatic.concat(newValue));
  };

  const handleChange = value => {
    setValue(value);
    onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: value }] : []);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DynamicValueInputWrap>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList {...props} onClick={() => setVisible(true)} />
      ) : (
        <RichText
          className="richInputText"
          key={data.controlId}
          data={value}
          disabled={true}
          minHeight={34}
          maxHeight={90}
          onClickNull={() => {
            setVisible(true);
          }}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />

      <Modal
        className="appIntroDialog"
        wrapClassName="appIntroDialogWrapCenter"
        footer={null}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        centered={true}
        width={800}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        bodyStyle={{ minHeight: '480px', padding: 0 }}
        closeIcon={<Icon icon="close" />}
      >
        <EditIntro
          description={value}
          permissionType={100} //可编辑的权限
          isEditing={true}
          cacheKey={'remarkDes'}
          onSave={tempValue => {
            handleChange(tempValue === null ? value : tempValue);
            setVisible(false);
          }}
          onCancel={() => {
            setVisible(false);
          }}
          title={_l('内容')}
        />
      </Modal>
    </DynamicValueInputWrap>
  );
}
