import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Icon, SortableList, Tooltip, UserHead } from 'ming-ui';
import departmentAjax from 'src/api/department';
import { List, Wrap } from './style';

function SortTopUp(props) {
  const { visible, departmentName, departmentId, projectId, onOk, onCancel } = props;

  const [sortList, setSortList] = useState([]);

  useEffect(() => {
    if (!departmentId) return;
    getData();
  }, [departmentId]);

  const getData = () => {
    departmentAjax
      .getTopDisplayMembers({
        projectId,
        departmentId,
      })
      .then(res => {
        if (res.list) {
          setSortList(res.list);
        }
      });
  };

  const onDelete = item => {
    setSortList(sortList.filter(l => l.accountId !== item.accountId));
  };

  const onSave = () => {
    departmentAjax
      .resetTopDisplayOrders({
        projectId,
        departmentId,
        orderedMemberIds: sortList.map(l => l.accountId),
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功'));
          onOk();
          onCancel();
          return;
        }
        alert(_l('设置失败'), 2);
      });
  };

  const renderItem = ({ item, DragHandle }) => {
    return (
      <div className="sortItem">
        <DragHandle>
          <Icon icon="drag" className="dragIcon mRight12 Font16 Gray_bd Hover_21" />
        </DragHandle>

        <UserHead projectId={projectId} size={28} user={{ userHead: item.avatar, accountId: item.accountId }} />
        <span className="flex overflow_ellipsis mLeft8">{item.fullname}</span>
        <Tooltip text={_l('取消置顶')}>
          <Icon icon="close" className="mLeft8 Font14 Gray_9e Hover_21" onClick={() => onDelete(item)} />
        </Tooltip>
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      type="fixed"
      title={_l('“%0” 的置顶成员排序', departmentName)}
      okText={_l('保存')}
      onOk={onSave}
      onCancel={onCancel}
    >
      <Wrap className="flexColumn">
        <div className="Gray_75 Font13 mBottom24">{_l('在人员选择层、通讯录中按部门查看时，按设置的排序显示')}</div>
        <div className="Gray_3 Font14 mBottom16">{sortList.length}/50</div>
        <List className="flex">
          <SortableList
            useDragHandle
            items={sortList}
            renderItem={renderItem}
            itemKey="accountId"
            onSortEnd={newItems => setSortList(newItems)}
          />
        </List>
      </Wrap>
    </Dialog>
  );
}

export default SortTopUp;
