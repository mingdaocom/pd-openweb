import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';

const Wrap = styled.div`
  .aggCon {
    padding: 2px 5px;
    background: #f5f5f5;
    border-radius: 3px;
  }
`;

export default function MoveDialog(props) {
  const { onCancel, onOk, className, projectId, item } = props;
  const [{ appList, selectAppId }, setState] = useSetState({
    appList: [],
    selectAppId: '',
  });
  useEffect(() => {
    getApp();
  }, []);
  const getApp = () => {
    ajaxRequest.getManagerApps({ projectId }).then(result => {
      result = result.map(({ appId, appName }) => {
        if (props.appId === appId) {
          appName += _l('（本应用）');
        }
        return {
          value: appId,
          text: appName,
        };
      });
      setState({ appList: result });
    });
  };
  const onMove = () => {
    if (!selectAppId || props.appId === selectAppId) {
      return;
    }
    AggTableAjax.move(
      {
        appId: selectAppId,
        projectId,
        aggTableId: item.aggTableId,
      },
      { isAggTable: true },
    ).then(() => {
      onOk();
      onCancel();
    });
  };
  return (
    <Dialog
      dialogClasses={className}
      className={cx('')}
      visible={true}
      anim={false}
      title={_l('移动到')}
      width={560}
      onCancel={onCancel}
      onOk={onMove}
      okDisabled={!(selectAppId && selectAppId !== props.appId)}
    >
      <Wrap className="">
        <div className="Gray_75 flexRow alignItemsCenter">
          {_l('将')}
          <div className="mLeft10 mRight10 flexRow alignItemsCenter aggCon">
            <div className="iconCon">
              <Icon icon={'aggregate_table'} className={'iconTitle Font18'} />
            </div>
            <span className={'flex WordBreak overflow_ellipsis Font14'}>{item.name}</span>
          </div>
          {_l('移动到')}
        </div>
        <div className="title Font14 Bold mTop10">{_l('应用')}</div>
        <Dropdown
          isAppendToBody
          className="mTop10 w100"
          border
          openSearch
          data={appList}
          onChange={newValue => {
            setState({
              selectAppId: newValue,
            });
          }}
        />
      </Wrap>
    </Dialog>
  );
}
