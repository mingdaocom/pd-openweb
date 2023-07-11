import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import functionWrap from 'ming-ui/components/FunctionWrap';
import RelateRecordTable from 'worksheet/common/recordInfo/RecordForm/RelateRecordTable';
import { handleOpenInNew } from 'worksheet/common/recordInfo/crtl';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .tableOperate {
    padding: 0 24px 8px !important;
    height: 44px;
  }
`;

const Header = styled.div`
  height: 50px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  .main {
    font-size: 17px;
    color: #333;
    font-weight: bold;
  }
  .split {
    font-size: 16px;
    margin: 0 8px;
    color: #9e9e9e;
  }
  .sec {
    font-size: 17px;
    color: #757575;
    max-width: 600px;
    &:hover {
      color: #333;
    }
  }
  .openInNewTab {
    cursor: pointer;
    color: #9e9e9e;
    font-size: 14px;
    margin-left: 6px;
    line-height: 18px;
    height: 18px;
  }
  .flexCenter {
    display: flex;
    align-items: center;
  }
`;
const Content = styled.div`
  padding: 0 0 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  .relateRecordTable {
    height: 100%;
  }
  .tableCon {
    flex: 1;
  }
`;

function Table(props) {
  const { title, appId, worksheetId, recordId, allowEdit, formdata, control } = props;
  const [loading, setLoading] = useState(true);
  return (
    <RelateRecordTable
      mode="dialog"
      loading={loading}
      useHeight
      formWidth={500}
      recordbase={{
        appId,
        worksheetId,
        recordId,
        allowEdit,
      }}
      // recordinfo={recordinfo}
      formdata={formdata}
      pageSize={50}
      control={control}
      controls={control.relationControls}
      from={control.isDraft ? 21 : undefined}
      onRelateRecordsChange={records => {}}
      updateLoading={setLoading}
    />
  );
}

Table.propTypes = {
  allowEdit: PropTypes.bool,
  appId: PropTypes.string,
  control: PropTypes.shape({}),
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  recordId: PropTypes.string,
  worksheetId: PropTypes.string,
};

export default function RelateRecordTableDialog(props) {
  const {
    title,
    appId,
    viewId,
    worksheetId,
    recordId,
    control,
    formdata,
    allowEdit,
    onClose,
    reloadTable = () => {},
  } = props;
  const allowOpenInNew = !control.isDraft && !_.get(window, 'shareState.shareId');
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  return (
    <Modal
      visible
      type="fixed"
      verticalAlign="bottom"
      width={width}
      closeSize={50}
      onCancel={() => {
        reloadTable();
        onClose();
      }}
      bodyStyle={{ padding: 0, position: 'relative' }}
    >
      <Con>
        <Header>
          <div className="main">{control.controlName}</div>
          {!!title && <div className="split"> - </div>}
          <div
            className={cx('flexCenter', { Hand: allowOpenInNew })}
            onClick={() => allowOpenInNew && handleOpenInNew({ appId, worksheetId, viewId, recordId })}
          >
            <div className="sec ellipsis">{title}</div>
            {allowOpenInNew && (
              <span className="openInNewTab ThemeHoverColor3" data-tip={_l('新窗口打开')}>
                <i className="icon-launch" />
              </span>
            )}
          </div>
        </Header>
        <Content>
          <Table {...{ appId, worksheetId, recordId, allowEdit, formdata, control }} />
        </Content>
      </Con>
    </Modal>
  );
}

RelateRecordTableDialog.propTypes = {
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  allowEdit: PropTypes.bool,
  appId: PropTypes.string,
  control: PropTypes.shape({}),
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  reloadTable: PropTypes.func,
  onClose: PropTypes.func,
};

export const openRelateRelateRecordTable = props => functionWrap(RelateRecordTableDialog, props);
