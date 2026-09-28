import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import EditIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';
import { SettingItem } from '../../styled';

const Wrap = styled.div`
  .fieldEditorRemark {
    &.editorNull {
      padding: 10px 0px !important;
    }
    .ck-content {
      padding: 0 12px !important;
    }
  }
  .fieldEditorRemark.hasData {
    .ck .ck-content {
      border: 1px solid var(--color-border-primary) !important;
      &:hover {
        border: 1px solid var(--color-primary) !important;
      }
    }
  }
`;

export default function Remark({ data, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('备注内容')}</div>
        <Wrap className="settingContent">
          <RichText
            key={data.controlId}
            className={cx('fieldEditorRemark', { hasData: !!data.dataSource })}
            data={data.dataSource}
            disabled={true}
            minHeight={45}
            maxHeight={500}
            placeholder={_l('点击设置备注')}
            onClickNull={() => {
              setShow(true);
            }}
          />
        </Wrap>
        {show && (
          <Modal
            className="appIntroDialog"
            wrapClassName="appIntroDialogWrapCenter"
            footer={null}
            open={show}
            onCancel={() => {
              setShow(false);
            }}
            centered={true}
            width={800}
            closeIcon={<Icon icon="close" />}
            styles={{
              body: { minHeight: '480px', padding: 0 },
              container: { padding: 0 },
            }}
          >
            <EditIntro
              description={data.dataSource}
              permissionType={100} //可编辑的权限
              isEditing={true}
              cacheKey={'remarkDes'}
              onSave={data => {
                const description = data.description;
                onChange({ dataSource: description === null ? data.dataSource : description });
                setShow(false);
              }}
              onCancel={() => {
                setShow(false);
              }}
              title={_l('内容')}
            />
          </Modal>
        )}
      </SettingItem>
    </Fragment>
  );
}
