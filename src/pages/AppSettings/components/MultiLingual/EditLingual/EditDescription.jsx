import React, { Fragment, useState } from 'react';
import { RichText } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import EditAppIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';
import { filterHtmlTag } from '../util';

export default function (props) {
  const { title = _l('应用说明'), value, originalValue, onChange } = props;
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
        width={1600}
        footer={null}
        className="appIntroDialog appMultilingualDialog"
        wrapClassName="appIntroDialogWrapCenter"
        open={editAppIntroVisible}
        onClose={() => setEditAppIntroVisible(false)}
        closable={false}
        styles={{ container: { padding: 0 } }}
      >
        <EditAppIntro
          title={title}
          description={value}
          permissionType={100}
          isEditing={true}
          showRemark={false}
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
          onSave={({ description }) => {
            onChange(description || undefined);
            setEditAppIntroVisible(false);
          }}
          onCancel={() => setEditAppIntroVisible(false)}
        />
      </Modal>
    </Fragment>
  );
}
