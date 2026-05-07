import React, { Fragment, memo, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, ScrollView } from 'ming-ui';
import MarkdownPreview from '../MarkdownPreview';

const EnhanceInfoBtn = styled.div`
  display: flex;
  align-items: center;
  right: 10px;
  color: var(--color-text-primary);
  cursor: pointer;
  .icon {
    margin-right: 4px;
    font-size: 16px;
    color: var(--color-mingo);
  }
`;

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
      <EnhanceInfoBtn className={className} onClick={() => setVisible(true)}>
        <Icon icon="auto_one_star" />
        {title}
      </EnhanceInfoBtn>
      {visible && (
        <Dialog visible width={800} title={_l('增强信息')} onCancel={() => setVisible(false)} footer={null}>
          <EnhanceInfoContent>
            <ScrollView>
              <div className="contentBox">
                {content?.map((item, index) => (
                  <MarkdownPreview key={index} content={item} />
                ))}
              </div>
            </ScrollView>
          </EnhanceInfoContent>
        </Dialog>
      )}
    </Fragment>
  );
};

export default memo(EnhanceInfoDialog);
