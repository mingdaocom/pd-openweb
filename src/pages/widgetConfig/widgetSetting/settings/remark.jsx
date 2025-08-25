import React, { Fragment, useState } from 'react';
import { Modal } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';
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
      border: 1px solid #dddddd !important;
      &:hover {
        border: 1px solid #1677ff !important;
      }
    }
  }
`;
export default function Remark({ data, onChange }) {
  const [show, setShow] = useState(false);
  const [hasChange, setHasChange] = useState(false);
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
            visible={show}
            onCancel={() => {
              setShow(false);
            }}
            centered={true}
            width={800}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            bodyStyle={{ minHeight: '480px', padding: 0 }}
            closeIcon={<Icon icon="close" />}
          >
            <EditIntro
              description={data.dataSource}
              permissionType={100} //可编辑的权限
              isEditing={true}
              cacheKey={'remarkDes'}
              changeSetting={setHasChange}
              onSave={value => {
                onChange({ dataSource: !value ? (hasChange ? value : data.dataSource) : value });
                setShow(false);
                setHasChange(false);
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
