import React, { Fragment, memo } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const CardPlaceholder = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 130px;
  height: 130px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  color: var(--color-text-primary);
  font-size: 12px;
  background-color: var(--color-background-secondary);
  .closeIcon {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 16px;
    color: var(--color-text-inverse);
    border-radius: 50%;
    background-color: var(--color-border-hover);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
  }
  .fileName {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    font-weight: 500;
  }
`;

const ListPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-right: 5px;
  margin-bottom: 6px;
  min-width: 300px;
  height: 56px;
  border-radius: 4px;
  background-color: var(--color-background-secondary);
  overflow: hidden;
  .placeholder {
    width: 56px;
    height: 56px;
    background-color: #e0e0e0;
  }
  .fileName {
    padding: 0 10px;
    flex: 1;
    font-size: 13px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .closeIcon {
    font-size: 19px;
    color: #9e9e9e !important;
  }
`;

const WaitingUpload = props => {
  const { type, file, removeUploadingFile } = props;

  return (
    <Fragment>
      {type === '1' ? (
        <CardPlaceholder>
          <Icon className="closeIcon" icon="close" onClick={() => removeUploadingFile(file)} />
          <div>{_l('等待上传')}</div>
          <div className="fileName ellipsis">
            {file?.base?.fileName || _l('未命名')}
            {file?.base?.fileExt}
          </div>
        </CardPlaceholder>
      ) : (
        <ListPlaceholder>
          <div className="placeholder"></div>
          <div className="fileName ellipsis">
            {file?.base?.fileName || _l('未命名')}
            {file?.base?.fileExt}
          </div>
          <Icon className="closeIcon" icon="cancel" onClick={() => removeUploadingFile(file)} />
        </ListPlaceholder>
      )}
    </Fragment>
  );
};

export default memo(WaitingUpload);
