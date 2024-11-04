import React, { useState } from 'react';
import { Modal, Dropdown, Icon, UserHead, UserName } from 'ming-ui';
import styled from 'styled-components';
import { DatePicker } from 'antd';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import moment from 'moment';
import { dialogSelectUser } from 'ming-ui/functions';
import delegationApi from 'src/pages/workflow/api/delegation';
import _ from 'lodash';

const ModalTitle = styled.div`
  font-size: 17px;
  color: #333333;
  font-weight: bold;
`;

const ModalHintText = styled.div`
  color: #757575;
  font-size: 13px;
`;

const FormItem = styled.div`
  margin-top: 25px;
  color: #333;
  font-size: 14px;
`;

const UserItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  border-radius: 24px;
  background-color: #f7f7f7;
`;

const TrusteeAddButton = styled.div`
  display: inline-flex;
  width: 26px;
  height: 26px;
  line-height: 26px;
  border: 1px solid #ddd;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  .addOrTransferIcon {
    color: #757575;
  }
  &:hover {
    border-color: #2196f3;
    .addOrTransferIcon {
      color: #2196f3;
    }
  }
`;

const EntrustDateWrapper = styled.div`
  display: flex;

  .dateItem {
    width: 288px;
  }
`;

export default function TodoEntrustModal(props) {
  const { setTodoEntrustModalVisible, editEntrustData, delegationList, setDelegationList } = props;
  const existCompanyIds = delegationList ? delegationList.map(item => item.companyId) : [];
  const projectOptions = md.global.Account.projects.map(item => {
    return {
      text: item.companyName,
      value: item.projectId,
      disabled: existCompanyIds.indexOf(item.projectId) >= 0 && item.projectId !== editEntrustData.companyId,
    };
  });
  const isEdit = !_.isEmpty(editEntrustData);
  const [formData, setFormData] = useState(
    isEdit ? editEntrustData : { companyId: (projectOptions.filter(item => !item.disabled)[0] || {}).value },
  );
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const updateDataSource = options => {
    setFormData(Object.assign({}, formData, options));
  };

  const disabledDateTime = date => {
    const hours = moment().hours();
    const minutes = moment().minutes();
    if (!date || moment(date).isSame(moment(), 'd')) {
      return {
        disabledHours: () => Array.from(Array(hours), (_, k) => k),
        disabledMinutes: () =>
          !date || moment(date).isSame(moment(), 'h') ? Array.from(Array(minutes), (_, k) => k) : [],
      };
    }
    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
    };
  };

  const onAddOrChangeMember = () => {
    dialogSelectUser({
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        selectedAccountIds: (formData.trustee || {}).accountId ? [(formData.trustee || {}).accountId] : [],
        projectId: formData.companyId,
        filterAll: true,
        filterFriend: true,
        filterOtherProject: true,
        unique: true,
        callback: users => updateDataSource({ trustee: users[0] }),
      },
    });
  };

  const onSubmit = () => {
    const params = {
      companyId: formData.companyId,
      startDate: formData.startDate ? moment(formData.startDate).format('YYYY-MM-DD HH:mm:ss') : '',
      endDate: moment(formData.endDate).format('YYYY-MM-DD HH:mm:ss'),
      trustee: formData.trustee.accountId,
    };
    if (moment(formData.endDate).diff(moment(formData.startDate), 'minutes') <= 0) {
      alert(_l('委托结束时间应大于开始时间'), 2);
      return;
    }
    if (isEdit) {
      delegationApi.update({ ...params, id: editEntrustData.id, status: editEntrustData.status }).then(res => {
        if (res) {
          setTodoEntrustModalVisible(false);
          delegationApi.getList().then(result => setDelegationList(result));
          alert(_l('更新委托成功'));
        }
      });
    } else {
      delegationApi.add(params).then(res => {
        if (res) {
          setTodoEntrustModalVisible(false);
          delegationApi.getList().then(result => setDelegationList(result));
          alert(_l('添加委托成功'));
        }
      });
    }
  };

  return (
    <React.Fragment>
      <Modal
        visible
        width={640}
        bodyStyle={{ padding: '16px 24px' }}
        okDisabled={!(formData.trustee && formData.companyId && formData.endDate)}
        onOk={onSubmit}
        onCancel={() => setTodoEntrustModalVisible(false)}
      >
        <ModalTitle>{_l('待办委托')}</ModalTitle>
        <ModalHintText>{_l('发起委托后，您负责的审批、填写事项将转交给被委托人')}</ModalHintText>

        <FormItem>
          <span className="bold">{_l('组织')}</span>
          <span className="Red bold"> *</span>
          <div>
            <Dropdown
              className="mTop10 w100 Font13"
              isAppendToBody
              border
              value={formData.companyId}
              data={projectOptions}
              onChange={companyId => updateDataSource({ companyId, trustee: '' })}
            />
          </div>
        </FormItem>

        <FormItem>
          <span className="bold">{_l('委托给')}</span>
          <span className="Red bold"> *</span>
          <div className="flexRow mTop10">
            {formData.trustee && (
              <UserItemWrapper>
                <UserHead
                  className="circle"
                  user={{
                    userHead: formData.trustee.avatar,
                    accountId: formData.trustee.accountId,
                  }}
                  size={26}
                />
                <UserName
                  className="Gray Font13 pLeft5 pRight10 pTop2"
                  user={{
                    userName: formData.trustee.fullName || formData.trustee.fullname,
                    accountId: formData.trustee.accountId,
                  }}
                />
              </UserItemWrapper>
            )}
            <TrusteeAddButton onClick={onAddOrChangeMember}>
              <Icon icon={formData.trustee ? 'swap_horiz' : 'plus'} className="Font16 addOrTransferIcon" />
            </TrusteeAddButton>
          </div>
        </FormItem>

        <FormItem>
          <span className="bold">{_l('委托时间')}</span>
          <EntrustDateWrapper>
            <div className="mTop10 mRight16 dateItem">
              <div className="Font13 mBottom5">{_l('开始')}</div>
              <DatePicker
                style={{ width: '100%', borderRadius: '3px' }}
                placeholder={_l('此刻')}
                showTime
                disabledDate={date => date < moment().subtract(1, 'd')}
                disabledTime={disabledDateTime}
                format="YYYY-MM-DD HH:mm"
                locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
                defaultValue={formData.startDate}
                allowClear={true}
                onChange={startDate => updateDataSource({ startDate })}
              />
            </div>
            <div className="mTop10 dateItem">
              <div className="Font13 mBottom5">
                {_l('结束')}
                <span className="Red bold"> *</span>
              </div>
              <DatePicker
                style={{ width: '100%', borderRadius: '3px' }}
                placeholder={_l('请选择日期')}
                showTime
                disabledDate={date => date < moment().subtract(1, 'd')}
                disabledTime={disabledDateTime}
                format="YYYY-MM-DD HH:mm"
                defaultValue={formData.endDate}
                allowClear={true}
                locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
                onChange={endDate => updateDataSource({ endDate })}
              />
            </div>
          </EntrustDateWrapper>
        </FormItem>
      </Modal>
    </React.Fragment>
  );
}
