import React, { Component } from 'react';
import PropTypes from 'prop-types';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { Dialog, Icon } from 'ming-ui';
import { Drawer } from 'antd';
import WorksheetRocordLog from './WorksheetRocordLog';
import _ from 'lodash';
import './WorksheetRecordLogDialog.less';
import { browserIsMobile } from 'src/util';

@errorBoundary
export default class WorksheetRecordLogDialog extends Component {
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
          width={'85%'}
          className="sheetWorkflowDrawer"
          closable={false}
          mask={true}
          style={{ position: 'absolute' }}
          onClose={onClose}
          visible={visible}
        >
          <div className="h100 flexColumn">
            <div className="flexRow alignItemsCenter mTop20 mRight20 mBottom5 pLeft10">
              <Icon icon="arrow-left-border" className="Font20 Gray_bd mRight5" onClick={onClose} />
              <div class="Font17 bold">{_l('更新记录')}</div>
            </div>
            {Content}
          </div>
        </Drawer>
      );
    } else {
      return (
        <Dialog
          className="worksheetRecordDialog"
          bodyClass="worksheetRecordDialogBody"
          title={_l('更新记录')}
          width={560}
          showFooter={false}
          onCancel={onClose}
          visible={visible}
          overlayClosable={false}
          onScroll={this.handleScroll}
        >
          {Content}
        </Dialog>
      );
    }
  }
}
