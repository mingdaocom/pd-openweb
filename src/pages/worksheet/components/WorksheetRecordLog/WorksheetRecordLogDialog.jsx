import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Drawer, Modal } from 'ming-ui/antd-components';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import WorksheetRocordLog from './WorksheetRocordLog';
import './WorksheetRecordLogDialog.less';

class WorksheetRecordLogDialog extends Component {
  static propTypes = {
    appId: PropTypes.string,
    controls: PropTypes.array,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    worksheetId: PropTypes.string,
    rowId: PropTypes.string,
    filterUniqueIds: PropTypes.arrayOf(PropTypes.string),
  };

  logRef = React.createRef();

  handleScroll = _.throttle(e => {
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
      this.logRef.current.handleScroll();
    }
  });
  render() {
    const { appId, controls, visible, onClose, worksheetId, filterUniqueIds, rowId } = this.props;
    if (!worksheetId || !filterUniqueIds || !appId) return null;

    const Content = (
      <WorksheetRocordLog
        ref={this.logRef}
        appId={appId}
        rowId={rowId}
        filterUniqueIds={filterUniqueIds}
        worksheetId={worksheetId}
        showFilter={false}
        controls={controls}
      />
    );

    if (browserIsMobile()) {
      return (
        <Drawer
          placement="right"
          size={'85%'}
          rootClassName="sheetWorkflowDrawer"
          closable={false}
          mask={true}
          rootStyle={{ position: 'absolute' }}
          onClose={onClose}
          open={visible}
        >
          <div className="h100 flexColumn">
            <div className="flexRow alignItemsCenter mTop20 mRight20 mBottom5 pLeft10">
              <Icon icon="arrow-left-border" className="Font20 textDisabled mRight5" onClick={onClose} />
              <div class="Font17 bold">{_l('更新记录')}</div>
            </div>
            {Content}
          </div>
        </Drawer>
      );
    } else {
      return (
        <Modal
          rootClassName="worksheetRecordDialog"
          title={_l('更新记录')}
          width={560}
          footer={null}
          onCancel={onClose}
          open={visible}
          mask={{ closable: false }}
          keyboard
          styles={{ container: { minHeight: 500, padding: 0 }, header: { padding: '16px 24px 0' } }}
        >
          <div className="worksheetRecordDialogBody" onScroll={this.handleScroll}>
            {Content}
          </div>
        </Modal>
      );
    }
  }
}

export default ErrorBoundary.wrap(WorksheetRecordLogDialog);
