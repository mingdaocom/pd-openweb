import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Input, Modal, Tooltip } from 'ming-ui/antd-components';
import { generateAppOrWorksheetDescription } from 'src/utils/services/app';

const REMARK_TEXTAREA_AUTO_SIZE = { minRows: 1, maxRows: 5 };

const Wrapper = styled.div`
  .withdraw,
  .active {
    padding: 2px 5px;
    border-radius: 3px;
  }
  .withdraw:hover {
    background: var(--color-background-hover);
  }
  .active {
    cursor: pointer;
    color: var(--color-mingo-light);
    &:hover {
      background: #9709f20f;
    }
  }
  .error {
    .TxtRight {
      color: var(--color-error);
    }
  }
`;

const remarkMaxLength = 150;

const CreateAppDialog = props => {
  const { onSave, onCancel } = props;
  const [appInfo, setAppInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCreateAi = () => {
    setLoading(true);
    setAppInfo(values => ({ ...values, shortdesc: '' }));
    generateAppOrWorksheetDescription({
      name: appInfo.name,
      description: appInfo.shortdesc,
      data: appInfo,
      isApp: true,
    })
      .then(res => {
        const { isSuccess, content, errorMsg } = res.data || {};

        if (isSuccess) {
          setAppInfo(values => ({ ...values, sourceAi: true, shortdesc: content.value }));
        } else {
          alert(errorMsg, 3);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const renderState = () => {
    if (loading) {
      return (
        <div className="flexRow alignItemsCenter">
          <LoadDiv className="mRight5" size="small" />
          {_l('AI 生成中...')}
        </div>
      );
    }

    if (appInfo.shortdesc && appInfo.sourceAi && !loading) {
      return (
        <div
          className="flexRow alignItemsCenter textTertiary withdraw pointer"
          onClick={() => {
            setAppInfo(values => ({ ...values, sourceAi: undefined, shortdesc: appInfo.lastShortdesc || '' }));
          }}
        >
          <Icon icon="back" className="Font17 mRight2" />
          {_l('撤销')}
        </div>
      );
    }

    if (!appInfo.name) return null;
    return (
      <div
        className={cx('flexRow alignItemsCenter', { active: appInfo.name, textTertiary: !appInfo.name })}
        onClick={appInfo.name && handleCreateAi}
      >
        <span className="mRight4 bold">{_l('AI 生成')}</span>
        <Icon icon="auto_awesome" />
      </div>
    );
  };

  const isError = _.get(appInfo, 'shortdesc.length') > remarkMaxLength;

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      title={_l('从空白创建应用')}
      okText={_l('创建')}
      width={540}
      onOk={() => {
        const data = {
          name: appInfo.name || _l('未命名应用'),
          shortdesc: appInfo.shortdesc,
        };

        if (loading) {
          return;
        }

        if (_.get(data, 'shortdesc.length') > remarkMaxLength) {
          alert(_l('描述文字超出上限'), 2);
          return;
        }

        onSave(data);
      }}
      onCancel={onCancel}
    >
      <Wrapper>
        <div className="mBottom20">
          <div className="mBottom10">
            <span>{_l('名称')}</span>
          </div>
          <div className="w100">
            <Input
              autoFocus={true}
              className="w100"
              placeholder={_l('请输入')}
              value={appInfo.name}
              onChange={event => setAppInfo(values => ({ ...values, name: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <div className="mBottom10 flexRow alignItemsCenter justifyContentBetween">
            <div className="flexRow alignItemsCenter">
              <span>{_l('备注')}</span>
              <Tooltip
                title={_l('用于概括应用的主要用途和业务定位，便于AI正确理解和使用。备注内容不会直接展示给普通用户。')}
              >
                <Icon icon="info_outline" className="textTertiary Font15 pointer mLeft5" />
              </Tooltip>
            </div>
            {!md.global.SysSettings.hideAIBasicFun && renderState()}
          </div>
          <div className={cx('w100', { error: isError })}>
            <Input.TextArea
              autoSize={REMARK_TEXTAREA_AUTO_SIZE}
              className="w100"
              disabled={loading}
              status={isError ? 'error' : undefined}
              placeholder={loading ? _l('AI 生成中...') : _l('例如: 跟进销售线索的客户管理系统')}
              value={appInfo.shortdesc}
              onChange={event =>
                setAppInfo(values => ({
                  ...values,
                  sourceAi: undefined,
                  shortdesc: event.target.value,
                  lastShortdesc: event.target.value,
                }))
              }
            />
            <div className="TxtRight">{isError ? `${appInfo.shortdesc.length} / ${remarkMaxLength}` : ''}</div>
          </div>
        </div>
      </Wrapper>
    </Modal>
  );
};

export default CreateAppDialog;
