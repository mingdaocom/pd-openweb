import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import mingoApi from 'src/api/mingo';

const Wrapper = styled.div`
  input,
  textarea {
    &::placeholder {
      color: #9e9e9e;
    }
  }
  .ming.Textarea {
    padding: 5px 12px;
    line-height: 24px;
  }
  .withdraw,
  .active {
    padding: 2px 5px;
    border-radius: 3px;
  }
  .withdraw:hover {
    background: #f5f5f5;
  }
  .active {
    cursor: pointer;
    color: #9709f2;
    &:hover {
      background: #9709f20f;
    }
  }
  .error {
    .ming.Textarea {
      border-color: red !important;
    }
    .TxtRight {
      color: red;
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
    mingoApi
      .generateAppOrWorksheetDescription({
        name: appInfo.name,
        desc: appInfo.shortdesc,
        type: 1,
        langType: getCurrentLangCode(),
      })
      .then(data => {
        const { isSuccess, content, errorMsg } = data;
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
          className="flexRow alignItemsCenter Gray_9e withdraw pointer"
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
        className={cx('flexRow alignItemsCenter', { active: appInfo.name, Gray_9e: !appInfo.name })}
        onClick={appInfo.name && handleCreateAi}
      >
        <span className="mRight4 bold">{_l('AI 生成')}</span>
        <Icon icon="auto_awesome" />
      </div>
    );
  };

  const isError = _.get(appInfo, 'shortdesc.length') > remarkMaxLength;

  return (
    <Dialog
      visible
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
              onChange={name => setAppInfo(values => ({ ...values, name }))}
            />
          </div>
        </div>
        <div>
          <div className="mBottom10 flexRow alignItemsCenter justifyContentBetween">
            <div className="flexRow alignItemsCenter">
              <span>{_l('描述')}</span>
              <Tooltip
                title={_l(
                  '用于概括应用的主要用途和业务定位，便于 AI 正确理解并运用表中的信息。该描述不会直接展示给普通用户。',
                )}
              >
                <Icon icon="info_outline" className="Gray_9e Font15 pointer mLeft5" />
              </Tooltip>
            </div>
            {!md.global.SysSettings.hideAIBasicFun && renderState()}
          </div>
          <div className={cx('w100', { error: isError })}>
            <Textarea
              className="w100"
              minHeight={36}
              maxHeight={36 * 2}
              disabled={loading}
              placeholder={loading ? _l('AI 生成中...') : _l('例如: 跟进销售线索的客户管理系统')}
              value={appInfo.shortdesc}
              onChange={shortdesc =>
                setAppInfo(values => ({ ...values, sourceAi: undefined, shortdesc, lastShortdesc: shortdesc }))
              }
            />
            <div className="TxtRight">{isError ? `${appInfo.shortdesc.length} / ${remarkMaxLength}` : ''}</div>
          </div>
        </div>
      </Wrapper>
    </Dialog>
  );
};

export default CreateAppDialog;
