import React, { Fragment, useState } from 'react';
import { Input, Modal } from 'antd';
import { RichText } from 'ming-ui';
import EditAppIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';
import { filterHtmlTag } from '../util';

export default function (props) {
  const { value, originalValue, onChange } = props;
  const [editAppIntroVisible, setEditAppIntroVisible] = useState(false);

  return (
    <Fragment>
      <Input.TextArea
        readOnly={true}
        style={{ resize: 'none' }}
        className="flex pointer"
        value={filterHtmlTag(value)}
        placeholder={_l('点击输入内容')}
        onClick={() => setEditAppIntroVisible(true)}
      />
      <Modal
        centered={true}
        zIndex={1000}
        width={1600}
        footer={null}
        destroyOnClose={true}
        className="appIntroDialog appMultilingualDialog"
        wrapClassName="appIntroDialogWrapCenter"
        visible={editAppIntroVisible}
        onClose={() => setEditAppIntroVisible(false)}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        bodyStyle={{ padding: 0 }}
        closable={false}
        // closeIcon={<Icon icon="close" />}
      >
        <EditAppIntro
          title={_l('应用说明')}
          description={value}
          permissionType={100}
          isEditing={true}
          cacheKey="appMultilingual"
          renderLeftContent={() => (
            <RichText
              data={originalValue}
              className="editorContent mdEditorContent"
              disabled={true}
              showTool={false}
              changeSetting={false}
            />
          )}
          onSave={value => {
            onChange(value || undefined);
            setEditAppIntroVisible(false);
          }}
          onCancel={() => setEditAppIntroVisible(false)}
        />
      </Modal>
    </Fragment>
  );
}
