import React, { useState } from 'react';
import { Dropdown, Menu, Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import AppSettingHeader from '../AppSettingHeader';
import EmptyStatus from '../EmptyStatus';
import AddLangModal from './AddLangModal';

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
        color: #1677ff;
      }
      background-color: #f5f5f5;
    }
  }
  .operate {
    width: 50px;
  }
  .icon-more_horiz:hover {
    color: #1677ff !important;
  }
  .ant-select-selector {
    border-radius: 4px !important;
    box-shadow: none !important;
  }
`;

export default function LingualList(props) {
  const { app, currentLangKey, langs, allLangList } = props;
  const { onGetAppLangs, onChangeLangInfo } = props;
  const [visible, setVisible] = useState(false);
  const [originalLang, setOriginalLang] = useState(null);

  const handleDelete = data => {
    Dialog.confirm({
      title: _l('确认是否删除 %0 ?', renderLangName(data)),
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

  const handleSetOriginalLang = value => {
    homeAppApi
      .editAppOriginalLang({
        appId: app.id,
        originalLang: value,
      })
      .then(data => {
        if (data) {
          app.originalLang = value;
          setOriginalLang(value);
        }
      });
  };

  const renderLangName = data => {
    const lang = _.find(allLangList, { langCode: data.langCode }) || {};
    return `${lang[currentLangKey]} (${lang.localLang})`;
  };

  const selectAllLangList = allLangList.filter(item => !_.find(langs, { langCode: item.langCode }));
  const systemLangList = selectAllLangList.filter(data => data.isSystemLang);
  const portionLangList = selectAllLangList.filter(data => !data.isSystemLang);

  return (
    <Wrap className="h100 flexColumn" style={{ padding: '20px 40px' }}>
      <AppSettingHeader
        title={_l('语言')}
        addBtnName={_l('添加语言')}
        description={_l('设置用户在访问应用时可以使用的语言')}
        handleAdd={() => setVisible(true)}
      />
      <AddLangModal
        app={app}
        langs={langs}
        currentLangKey={currentLangKey}
        allLangList={allLangList}
        visible={visible}
        onSave={onGetAppLangs}
        onCancel={() => setVisible(false)}
      />
      <div className="Font14 bold flexRow alignItemsCenter">{_l('基准语言')}</div>
      <div className="Gray_75 TxtMiddle pTop10">
        {_l(
          '基准语言指搭建应用时使用的语言，eg:搭建应用时的文本语言(字段名称、标题等)为法语，则可以选择法语为您的基准语言。',
        )}
      </div>
      <Select
        className="mTop10 mBottom10"
        style={{ width: 'max-content', minWidth: 300 }}
        showSearch={true}
        allowClear={true}
        notFoundContent={<div className="valignWrapper">{_l('暂无数据')}</div>}
        filterOption={(searchValue, option) => {
          const name = renderLangName(_.find(allLangList, { langCode: option.value }));
          return searchValue && name ? name.toLowerCase().includes(searchValue.toLowerCase()) : true;
        }}
        value={originalLang || app.originalLang || null}
        placeholder={_l('未设置')}
        suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" style={{ marginRight: -4 }} />}
        onChange={value => {
          handleSetOriginalLang(value || '');
        }}
      >
        {systemLangList.concat(portionLangList).map(item => (
          <Select.Option key={item.langCode} value={item.langCode}>
            {renderLangName(item)}
          </Select.Option>
        ))}
      </Select>
      <div className="Font14 bold mTop10">{_l('其他语言')}</div>
      <div className="flex flexColumn">
        <div className="header flexRow Font14 Gray_9e">
          <div className="flex pLeft10">{_l('语言')}</div>
          <div className="flex">{_l('创建人')}</div>
          <div className="flex">{_l('创建时间')}</div>
          <div className="flex">{_l('最后更新时间')}</div>
          <div className="operate"></div>
        </div>
        <div className="content Font14 flex mBottom50">
          {langs.length ? (
            langs.map(data => (
              <div className="flexRow item" key={data.id}>
                <div className="flex pLeft10 bold langName" onClick={() => onChangeLangInfo(data)}>
                  {renderLangName(data)}
                </div>
                <div className="flex ellipsis pRight5">{_.get(data, 'creator.fullname')}</div>
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
            ))
          ) : (
            <EmptyStatus
              icon="language"
              radiusSize={130}
              iconClassName="Font50"
              emptyTxt={_l('暂无其他语言')}
              emptyTxtClassName="Gray_9e Font17 mTop20"
            />
          )}
        </div>
      </div>
    </Wrap>
  );
}
