import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Files from './index';

const Footer = styled.div`
  .ant-btn-link {
    color: #9e9e9e;
    &:hover {
      color: #1890ff;
    }
  }
  .ant-btn-primary {
    padding: 0 16px;
    &:hover {
      border-color: #007ff5;
      background-color: #007ff5;
    }
  }
`;

export default props => {
  const { visible, onCancel } = props;
  const { from, isDeleteFile, filesProps } = props;
  const [flag, setFlag] = useState('');
  // const [attachments, onChangeAttachments] = useState(filesProps.attachments);
  // const [knowledgeAtts, onChangeKnowledgeAtts] = useState(filesProps.knowledgeAtts);
  const [attachmentData, onChangeAttachmentData] = useState(filesProps.attachmentData);
  const isShare = _.get(window, 'shareState.shareId');

  useEffect(() => {
    onChangeAttachmentData(filesProps.attachmentData);
    setFlag(Date.now());
  }, [filesProps.attachmentData]);

  const renderFooter = () => {
    return (
      <ConfigProvider autoInsertSpaceInButton={false}>
        <Footer className="mTop5 mBottom5">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              // filesProps.onChangedAllFiles({
              //   attachments,
              //   knowledgeAtts,
              //   attachmentData
              // });
              filesProps.onChangeAttachmentData(attachmentData);
              onCancel();
            }}
          >
            {_l('确定')}
          </Button>
        </Footer>
      </ConfigProvider>
    );
  };

  return (
    <Modal
      title={_l('附件编辑')}
      width={1080}
      visible={visible}
      centered={true}
      destroyOnClose={true}
      closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
      footer={isShare || !filesProps.attachmentData.length ? null : renderFooter()}
      onCancel={onCancel}
    >
      <Files
        {...filesProps}
        showType={'1'}
        isDeleteFile={isDeleteFile}
        from={from}
        flag={flag}
        // attachments={attachments}
        // knowledgeAtts={knowledgeAtts}
        attachmentData={attachmentData}
        // onChangeAttachments={onChangeAttachments}
        // onChangeKnowledgeAtts={onChangeKnowledgeAtts}
        onChangeAttachmentData={res => {
          onChangeAttachmentData(res);
          setFlag(Date.now());
        }}
      />
    </Modal>
  );
};
