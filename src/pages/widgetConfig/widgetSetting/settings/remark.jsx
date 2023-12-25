import React, { Fragment, useState } from 'react';
import { SettingItem } from '../../styled';
import { RichText, Icon } from 'ming-ui';
import RcDialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import EditIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';
import styled from 'styled-components';
import cx from 'classnames';
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
        border: 1px solid #2196f3 !important;
      }
    }
  }
`;
export default function Remark({ data, onChange }) {
  const [show, setShow] = useState(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(300);
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
            onClickNull={e => {
              setShow(true);
            }}
          />
        </Wrap>
        {show && (
          <RcDialog
            className="appIntroDialog"
            wrapClassName="appIntroDialogWrapCenter"
            visible={show}
            onClose={() => {
              setShow(false);
            }}
            animation="zoom"
            style={{ width: '800px' }}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            bodyStyle={{ minHeight: '480px', padding: 0 }}
            maskAnimation="fade"
            // mousePosition={{ x: left, y: top }}
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
          </RcDialog>
        )}
      </SettingItem>
    </Fragment>
  );
}
