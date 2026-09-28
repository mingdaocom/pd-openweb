import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/appManagement';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';

const Wrap = styled.div`
  .aggCon {
    padding: 2px 5px;
    background: var(--color-background-secondary);
    border-radius: 3px;
  }
`;

export default function MoveDialog(props) {
  const { onCancel, onOk, className, projectId, appId, item } = props;
  const [{ appList, selectAppId }, setState] = useSetState({
    appList: [],
    selectAppId: '',
  });
  useEffect(() => {
    let cancelled = false;

    ajaxRequest.getManagerApps({ projectId }).then(result => {
      if (cancelled) return;

      result = result.map(({ appId: itemAppId, appName }) => {
        if (appId === itemAppId) {
          appName += _l('（本应用）');
        }

        return {
          value: itemAppId,
          label: appName,
        };
      });
      setState({ appList: result });
    });

    return () => {
      cancelled = true;
    };
  }, [appId, projectId, setState]);

  const onMove = () => {
    if (!selectAppId || appId === selectAppId) {
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
    <Modal
      wrapClassName={className}
      open
      title={_l('移动到')}
      width={560}
      keyboard
      onCancel={onCancel}
      onOk={onMove}
      okDisabled={!(selectAppId && selectAppId !== appId)}
    >
      <Wrap className="">
        <div className="textSecondary flexRow alignItemsCenter">
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
        <Select
          className="mTop10 w100"
          showPopupSearch
          optionFilterProp="label"
          options={appList}
          onChange={newValue => {
            setState({
              selectAppId: newValue,
            });
          }}
        />
      </Wrap>
    </Modal>
  );
}
