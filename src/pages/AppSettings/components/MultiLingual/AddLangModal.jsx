import React, { Fragment, useState } from 'react';
import { Checkbox, Drawer, Input, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, Support } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';

const CheckboxWrap = styled(Checkbox)`
  &.disabled .ant-checkbox-checked {
    opacity: 0.6;
  }
`;

const AddLangModal = props => {
  const { app, currentLangKey, allLangList = [], langs = [], visible, onCancel, onSave } = props;
  const [searchValue, setSearchValue] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(langs.map(n => n.langCode));

  const handleSave = () => {
    setSaveLoading(true);
    appManagementApi
      .createAppLang({
        projectId: app.projectId,
        appId: app.id,
        langCode: selectKey,
      })
      .then(() => {
        onCancel();
        onSave();
        setSaveLoading(false);
      });
  };

  const renderLangItem = data => {
    const disabled = _.find(langs, { langCode: data.langCode }) || app.originalLang === data.langCode;
    const Item = (
      <CheckboxWrap
        className={cx('mLeft0 mBottom10', { disabled })}
        key={data.langCode}
        checked={selectKey.includes(data.langCode)}
        onChange={e => {
          if (disabled) {
            return;
          }
          if (e.target.checked) {
            setSelectKey(selectKey.concat(data.langCode));
          } else {
            setSelectKey(selectKey.filter(n => n !== data.langCode));
          }
        }}
      >
        {data[currentLangKey]} ({data.localLang})
      </CheckboxWrap>
    );

    if (disabled) {
      return (
        <Tooltip placement="left" title={_l('已添加')}>
          {Item}
        </Tooltip>
      );
    } else {
      return Item;
    }
  };

  const systemLangList = allLangList
    .filter(data => (data[currentLangKey] || '').includes(searchValue))
    .filter(data => data.isSystemLang);
  const portionLangList = allLangList
    .filter(data => (data[currentLangKey] || '').includes(searchValue))
    .filter(data => !data.isSystemLang);

  return (
    <Drawer
      placement="right"
      title={
        <div className="flexRow alignItemsCenter">
          <div className="flex">{_l('添加语言')}</div>
          <Icon className="Gray_75 Font20 pointer" icon="close" onClick={onCancel} />
        </div>
      }
      bodyStyle={{
        padding: '12px 24px',
      }}
      footerStyle={{
        padding: '16px',
      }}
      width={700}
      visible={visible}
      closable={false}
      onClose={onCancel}
      footer={
        <Fragment>
          <Button onClick={handleSave} loading={saveLoading}>
            {_l('保存')}
          </Button>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
        </Fragment>
      }
    >
      <div className={cx('flexColumn', { h100: !(systemLangList.length + portionLangList.length) })}>
        <div className="flexRow alignItemsCenter mBottom10 pBottom10" style={{ borderBottom: '1px solid #efefef' }}>
          <Icon className="Gray_9e Font20" icon="search" />
          <Input bordered={false} placeholder={_l('搜索')} onChange={event => setSearchValue(event.target.value)} />
        </div>
        {!!systemLangList.length && (
          <Fragment>
            <div className="Gray bold">{_l('完整支持')}</div>
            <div className="Gray_75 mBottom10">{_l('以下语言系统提供完整支持')}</div>
          </Fragment>
        )}
        {systemLangList.map(data => renderLangItem(data))}
        {!!portionLangList.length && (
          <Fragment>
            <div className="Gray bold mTop20">{_l('部分支持')}</div>
            <div className="Gray_75 mBottom10">
              <span>{_l('以下语言仅可对应用内自定义内容配置多语言，系统语言未提供支持')}</span>
              <Support
                className="mLeft5"
                text={_l('帮助')}
                type={3}
                href="https://help.mingdao.com/application/language"
              />
            </div>
          </Fragment>
        )}
        {portionLangList.map(data => renderLangItem(data))}
        {!(systemLangList.length + portionLangList.length) && (
          <Fragment>
            <div className="flexRow alignItemsCenter justifyContentCenter flex Font14 Gray_75">
              {_l('没有搜索结果')}
            </div>
          </Fragment>
        )}
      </div>
    </Drawer>
  );
};

export default AddLangModal;
