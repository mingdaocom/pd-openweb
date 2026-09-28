import React, { Fragment, memo, useState } from 'react';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import MarkdownPreview from '../MarkdownPreview';

const EnhanceInfoContent = styled.div`
  height: 400px;
  .contentBox {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const EnhanceInfoDialog = props => {
  const { content, title = _l('增强信息'), className } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Fragment>
      <Button
        className={className}
        color="primary"
        variant="text"
        size="small"
        icon={<Icon icon="auto_one_star" />}
        onClick={() => setVisible(true)}
      >
        {title}
      </Button>
      {visible && (
        <Modal
          open
          width={800}
          title={_l('增强信息')}
          mask={{ closable: true }}
          keyboard
          onCancel={() => setVisible(false)}
        >
          <EnhanceInfoContent>
            <ScrollView>
              <div className="contentBox">
                {content?.map((item, index) => (
                  <MarkdownPreview key={index} content={item} />
                ))}
              </div>
            </ScrollView>
          </EnhanceInfoContent>
        </Modal>
      )}
    </Fragment>
  );
};

export default memo(EnhanceInfoDialog);
