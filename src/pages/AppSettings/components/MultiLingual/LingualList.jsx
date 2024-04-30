import React, { useState } from 'react';
import { Icon, Dialog } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import styled from 'styled-components';
import langConfig from 'src/common/langConfig';
import AddLangModal from './AddLangModal';
import AppSettingHeader from '../AppSettingHeader';
import appManagementApi from 'src/api/appManagement';

const Wrap = styled.div`
  .header {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .item {
    cursor: pointer;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
    &:hover {
      .langName {
        color: #2196f3;
      }
      background-color: #f5f5f5;
    }
  }
  .operate {
    width: 50px;
  }
  .icon-more_horiz:hover {
    color: #2196f3 !important;
  }
`;

export default function LingualList(props) {
  const { app, langs } = props;
  const { onGetAppLangs, onChangeLangInfo } = props;
  const [visible, setVisible] = useState(false);
  const handleDelete = data => {
    Dialog.confirm({
      title: _l('确认是否删除 %0 ?', _.find(langConfig, { code: data.type }).value),
      description: _l('删除后无法恢复语言'),
      buttonType: 'danger',
      onOk: () => {
        appManagementApi
          .deleteAppLang({
            projectId: app.projectId,
            appId: app.id,
            id: data.id,
          })
          .then(data => {
            if (data) {
              alert(_l('删除成功'));
              onGetAppLangs();
            } else {
              alert(_l('删除失败'), 2);
            }
          });
      },
    });
  };
  return (
    <div className="h100" style={{ padding: '20px 40px' }}>
      <AppSettingHeader
        title={_l('多语言')}
        addBtnName={_l('添加语言')}
        description={_l('设置用户在访问应用时可以使用的语言')}
        handleAdd={() => setVisible(true)}
      />
      {visible && (
        <AddLangModal
          app={app}
          langs={langs}
          visible={visible}
          onSave={onGetAppLangs}
          onCancel={() => setVisible(false)}
        />
      )}
      <Wrap>
        <div className="header flexRow Font14 Gray_9e">
          <div className="flex pLeft10">{_l('语言')}</div>
          <div className="flex">{_l('创建人')}</div>
          <div className="flex">{_l('创建时间')}</div>
          <div className="flex">{_l('最后更新时间')}</div>
          <div className="operate"></div>
        </div>
        <div className="content Font14">
          {langs.map(data => (
            <div className="flexRow item" key={data.id}>
              <div className="flex pLeft10 bold langName" onClick={() => onChangeLangInfo(data)}>
                {_.find(langConfig, { code: data.type }).value}
              </div>
              <div className="flex">{data.creator.fullname}</div>
              <div className="flex">{window.createTimeSpan(data.createTime)}</div>
              <div className="flex">{window.createTimeSpan(data.lastModifyTime)}</div>
              <div className="operate">
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu style={{ width: 100 }}>
                      <Menu.Item key="edit" onClick={() => onChangeLangInfo(data)}>
                        {_l('编辑')}
                      </Menu.Item>
                      <Menu.Item key="delete" danger onClick={() => handleDelete(data)}>
                        {_l('删除')}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Icon className="Gray_75 Font20" icon="more_horiz" />
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </div>
  );
}
