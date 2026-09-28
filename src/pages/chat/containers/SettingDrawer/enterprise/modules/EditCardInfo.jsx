import React, { Fragment, useState } from 'react';
import { Input, Modal } from 'ming-ui/antd-components';
import account from 'src/api/account';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './index.less';

const userInfoList = [
  { label: _l('姓名'), key: 'fullname' },
  { label: _l('部门'), key: 'departmentInfos' },
  { label: _l('职位'), key: 'jobInfos' },
  { label: _l('工作地点'), key: 'workSite' },
  { label: _l('工号'), key: 'jobNumber' },
];

const getItems = (list, key) => list.map(item => item[key]).join(' ; ');

const renderResult = (userInfo, item) => {
  const currentItem = userInfo[item.key];

  switch (item.key) {
    case 'departmentInfos':
      return !currentItem.length ? _l('未填写') : getItems(currentItem, 'departmentName');
    case 'jobInfos':
      return !currentItem.length ? _l('未填写') : getItems(currentItem, 'jobName');
    default:
      return !currentItem ? _l('未填写') : currentItem;
  }
};

function EditCardInfo({ userInfo, updateData = () => {}, closeDialog = () => {}, visible }) {
  const [contactPhone, setContactPhone] = useState(userInfo.contactPhone);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!contactPhone) {
      alert(_l('工作电话不能为空'), 2);
      return;
    }

    setSubmitting(true);
    return account
      .editUserCardContactPhone({
        projectId: userInfo.projectId,
        contactPhone,
      })
      .then(result => {
        if (result) {
          alert(_l('保存成功'));
          updateData({ ...userInfo, contactPhone });
          closeDialog();
        } else {
          alert(_l('操作失败'), 2);
          setSubmitting(false);
        }
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('操作失败'), 2);
        setSubmitting(false);
      });
  };

  return (
    <Modal
      open={visible}
      centered
      className="editInfoEnterprise"
      okText={_l('确认')}
      cancelText={_l('取消')}
      confirmLoading={submitting}
      closable={!submitting}
      onOk={handleSubmit}
      onCancel={() => {
        if (!submitting) closeDialog();
      }}
    >
      <div className="editEnterpriseCardInfo clearfix">
        <div className="Font17 Bold textPrimary">{_l('编辑名片')}</div>
        <div className="textTertiary mTop6">{_l('名片是您在该组织下的个人信息，只在本组织中展示。')}</div>
        <div className="mTop24">
          {userInfoList.map(item => (
            <Fragment key={item.key}>
              <div className="textSecondary">{item.label}</div>
              <div className="mTop6 mBottom16 textPrimary">{renderResult(userInfo, item)}</div>
            </Fragment>
          ))}
          <div className="textSecondary">{_l('工作电话')}</div>
          <Input
            className="mTop6"
            placeholder={_l('工作电话')}
            value={contactPhone}
            onChange={event => setContactPhone(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

export default EditCardInfo;
