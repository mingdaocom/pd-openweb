import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Dropdown, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import AppSettingHeader from '../AppSettingHeader';
import EmptyStatus from '../EmptyStatus';
import AddLangModal from './AddLangModal';

const Wrap = styled.div`
  .header {
    padding: 10px 0;
    border-bottom: 1px solid var(--color-background-disabled);
  }
  .item {
    cursor: pointer;
    padding: 20px 0;
    border-bottom: 1px solid var(--color-background-disabled);
    &:hover {
      .langName {
        color: var(--color-primary);
      }
      background-color: var(--color-background-hover);
    }
  }
  .operate {
    width: 50px;
  }
  .icon-more_horiz:hover {
    color: var(--color-primary) !important;
  }
`;

export default function LingualList(props) {
  const { app, currentLangKey, langs, allLangList } = props;
  const { onGetAppLangs, onChangeLangInfo } = props;
  const [visible, setVisible] = useState(false);
  const [originalLang, setOriginalLang] = useState(null);

  const handleDelete = data => {
    Modal.confirm({
      title: <span className="textError">{_l('确认是否删除 %0 ?', renderLangName(data))}</span>,
      content: _l('删除后无法恢复语言'),
      okButtonProps: {
        danger: true,
      },
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

  const asyncLangs = () => {
    appManagementApi
      .loadRelationLangData({
        appId: app.id,
        langIds: langs.map(o => o.id),
      })
      .then(res => {
        if (res) {
          alert(_l('同步中'));
          onGetAppLangs();
        } else {
          alert(_l('同步失败'), 2);
        }
      });
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
        extraElement={
          <Tooltip title={_l('将引用的跨应用语言资源(如选项集、关联表)同步至本应用')}>
            <Button color="default" variant="text" icon={<Icon icon="synchronization" />} onClick={asyncLangs}>
              {_l('同步引用语言')}
            </Button>
          </Tooltip>
        }
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
      <div className="textSecondary TxtMiddle pTop10">
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
        onChange={value => {
          handleSetOriginalLang(value || '');
        }}
        options={systemLangList.concat(portionLangList).map(item => ({
          value: item.langCode,
          label: renderLangName(item),
        }))}
      />
      <div className="Font14 bold mTop10">{_l('其他语言')}</div>
      <div className="flex flexColumn">
        <div className="header flexRow Font14 textTertiary">
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
                    menu={{
                      style: { minWidth: 100 },
                      items: [
                        {
                          key: 'edit',
                          label: _l('编辑'),
                          onClick: () => onChangeLangInfo(data),
                        },
                        {
                          key: 'delete',
                          danger: true,
                          label: _l('删除'),
                          onClick: () => handleDelete(data),
                        },
                      ],
                    }}
                  >
                    <Icon className="textSecondary Font20" icon="more_horiz" />
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
              emptyTxtClassName="textTertiary Font17 mTop20"
            />
          )}
        </div>
      </div>
    </Wrap>
  );
}
