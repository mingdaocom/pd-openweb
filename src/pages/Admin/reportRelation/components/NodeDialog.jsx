import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import ConnectedNode from './node';
import StructureController from 'src/api/structure';
import Config from '../../config';
import SearchInput from './searchBox';
import '../style/otherDialog.less';

const NodeWrap = styled.div`
  .userItem {
    display: flex;
    flex-direction: row;
    padding: 10px 0;
    height: 60px;
    box-sizing: initial;
    .avatar {
      margin-left: 10px;
      flex: 0 0 48px;
      height: 48px;
      border-radius: 50%;
      align-self: center;
    }
    .info {
      flex: 1 0 0%;
      margin-left: 16px;
      padding-right: 10px;
      display: flex;
      flex-direction: column;
      .name,
      .department,
      .job {
        flex: 1 0 0%;
        max-width: 155px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #9e9e9e;
        font-size: 12px;
      }
      .name {
        font-size: 15px;
        max-width: 135px;
        margin-bottom: 4px;
        color: #333;
      }
    }
    .subordinateCount {
      position: absolute;
      right: 50px;
      top: 10px;
    }
  }
`;

const EmptyWrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  .alignwrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .iconWrap {
    width: fit-content;
    padding: 30px;
    border-radius: 50%;
    background: #f5f5f5;
    margin: auto;
    .icon {
      color: #aaa;
      font-size: 90px;
    }
  }
`;

const DialogHeaderWrap = styled.div`
  padding-right: 16px;
`;

function NodeDialogWrap(props) {
  const { user, handleClose, auth, selectSearchUser, id } = props;

  const [data, setData] = useState([]);
  const [fIds, setFids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    id && getData();
  }, [id]);

  const getData = () => {
    setLoading(true);
    StructureController.getTreesByAccountId({
      projectId: Config.projectId,
      accountId: user.accountId,
    }).then(res => {
      setLoading(false);
      setFids(res.map(l => l.accountId));
      if(res.length === 0) {
        setData([]);
        return;
      }
       let projectInfo = Config.getProjectInfo();
      let users = {
        '': {
          id: '',
          accountId: '',
          collapsed: false,
          fullname: projectInfo.companyName,
          moreLoading: false,
          projectId: Config.projectId,
          subTotalCount: 1,
          subordinates: [res[0].accountId],
          disableMore: true,
          dataFromProps: true,
        },
      };
      res.forEach((l, index) => {
        users[l.accountId] = {
          ...l,
          id: l.accountId,
          accountId: l.accountId,
          collapsed: index + 1 === res.length ? true : false,
          fullname: l.fullname,
          moreLoading: false,
          subordinates: index + 1 === res.length ? undefined : [res[index + 1].accountId],
          dataFromProps: true,
          auth: index + 1 === res.length ? auth : false,
          disableMore: true,
        };
      });
      setData(users);
    });
  };

  const getSubordinates = ({ id, pageIndex }) => {
    StructureController.pagedGetAccountList({
      projectId: Config.projectId,
      pageIndex: pageIndex,
      pageSize: 20,
      parentId: id || '',
    }).then(({ pagedDatas }) => {
      let newUsers = {};
      pagedDatas.forEach((l, index) => {
        newUsers[l.accountId] = {
          ...l,
          id: l.accountId,
          collapsed: l.hasSub,
          subordinates: undefined,
          dataFromProps: true,
          firstLevelLoading: pageIndex === 1,
        };
      });
      data[id].subordinates =
        pageIndex === 1
          ? pagedDatas.map(l => l.accountId)
          : _.union(
              data[id].subordinates || [],
              pagedDatas.map(l => l.accountId),
            );
      data[id].moreLoading =
        data[id].subordinates &&
        data[id].subordinates.length !== 0 &&
        data[id].subTotalCount > data[id].subordinates.length;
      setData({
        ...data,
        ...newUsers,
      });
    });
  };

  const onChangeData = param => {
    const { type, value, id } = param;
    switch (type) {
      case 'EXPEND':
        const item = data[id];
        data[id].collapsed = value;
        if (item.hasSub && !value && (!item.subordinates || item.subordinates.length === 0)) {
          getSubordinates({ id: id, pageIndex: 1 });
        } else setData({ ...data });
        break;
      case 'REPLACE':
      case 'REMOVE':
      case 'ADD':
        getData();
        break;
    }
  };

  const renderEmpty = () => {
    return (
      <EmptyWrap>
        <div className="alignwrap">
          {loading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="iconWrap">
                <Icon icon="manage" className="" />
              </div>
              <div className="pTop20 Font15 Gray_9e">{_l('成员暂无汇报关系')}</div>
            </Fragment>
          )}
        </div>
      </EmptyWrap>
    );
  };

  return (
    <Dialog
      type="fixed"
      title={
        <DialogHeaderWrap>
          <span className="Font17 LineHeight32 Bold">{`“${user.fullname}” ${_l('的汇报关系')}`}</span>
          {auth && (
            <SearchInput
              onChange={value => {
                selectSearchUser(value);
              }}
            />
          )}
        </DialogHeaderWrap>
      }
      visible
      width={1000}
      footer={null}
      handleClose={handleClose}
    >
      {data.length === 0 ? (
        renderEmpty()
      ) : (
        <NodeWrap className='rootBoardBox'>
          {data[''] && (
            <ConnectedNode
              {...data['']}
              data={data}
              dataFromProps={true}
              pageIndex={1}
              level={0}
              key={'searchNode' + data[''].id}
              onChangeData={props => onChangeData(props)}
            />
          )}
        </NodeWrap>
      )}
    </Dialog>
  );
}

const NodeDialog = connect((state, ownProps) => {
  const {
    entities: { users },
  } = state;
  const user = users[ownProps.id];
  return {
    ...user,
    users: users,
    auth: ownProps.auth,
  };
})(NodeDialogWrap);

export default NodeDialog;
