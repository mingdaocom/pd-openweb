import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Modal, WingBlank, Button } from 'antd-mobile';
import { ScrollView } from 'ming-ui';
import NewRecordContent from './NewRecordContent';

export default function NewRecord(props) {
  const { visible, className, showFillNext, hideNewRecord, ...rest } = props;
  const newRecordContent = useRef(null);
  const header = (
    <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
      <div className="title Font18 Gray flex bold leftAlign ellipsis">{props.title || (props.entityName && _l('创建%0', props.entityName))}</div>
      <i className="icon icon-close Gray_9e Font20" onClick={hideNewRecord}></i>
    </div>
  );
  const content = <NewRecordContent registeFunc={funcs => (newRecordContent.current = funcs)} {...rest} continueCheck={false} showTitle={false} onCancel={hideNewRecord} from={5}/>;
  const footer = (
    <div className="footerBox btnsWrapper valignWrapper flexRow">
      <WingBlank className="flex" size="sm">
        <Button type="primary" onClick={() => newRecordContent.current.newRecord()}>
          {_l('确定')}
        </Button>
      </WingBlank>
    </div>
  );
  return (
    <Modal
      popup
      animationType="slide-up"
      className={cx('mobileNewRecordDialog', className)}
      onCancel={hideNewRecord}
      visible={visible}
    >
      <div className="flexColumn leftAlign h100">
        {header}
        <ScrollView className="flex">
          <div className="pAll20 pTop30 h100">{content}</div>
        </ScrollView>
        {footer}
      </div>
    </Modal>
  )
}

NewRecord.propTypes = {
  showFillNext: PropTypes.bool,
};
