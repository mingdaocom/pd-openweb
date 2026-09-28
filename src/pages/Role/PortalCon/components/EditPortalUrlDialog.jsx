import React, { useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal.js';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const Wrap = styled.div`
  .urlPre {
    background: var(--color-border-primary);
    border: 1px solid var(--color-border-primary);
    line-height: 34px;
    padding: 0 10px;
    border-radius: 3px 0 0 3px;
  }
  input {
    border-radius: 0 3px 3px 0;
    border: 1px solid var(--color-border-primary);
    line-height: 34px;
    padding: 0 5px;
    &:focus {
      border: 1px solid var(--color-primary);
    }
  }
`;

// 不能以中划线开头或结束（前端校验）
// 至少包含4位字母或数字（前端校验）
// 只能输入数字、字母、中划线（前端校验）
// 重复校验（点击确定按钮，或失焦时校验） 提示：此名称已被占用
// 不能和HAP地址冲突（点击确定按钮，或失焦时校验，提示：此名称和系统地址冲突，请重新输入
export default function EditPortalUrlDialog(props) {
  const { onOk, onCancel, urlPre, appId } = props;
  const [{ urlSuffix, loading, errStr }, setState] = useSetState({
    urlSuffix: props.urlSuffix,
    loading: false,
    errStr: '',
  });
  const requestPending = useRef(false);

  const verify = str => {
    if (!str.match(/[\d|\w]/g) || str.match(/[\d|\w]/g).length < 4) {
      setState({
        errStr: _l('至少包含4位字母或数字'),
      });
    } else if (!/^[a-zA-Z0-9-]+$/g.test(str)) {
      setState({
        errStr: _l('只能输入数字、字母、中划线'),
      });
    } else if (!/^[^-].+[^-]$/.test(str)) {
      setState({
        errStr: _l('不能以中划线开头或结束'),
      });
    } else {
      setState({
        errStr: '',
      });
    }
  };

  const editAddressSuffix = cb => {
    if (requestPending.current) return Promise.resolve();
    requestPending.current = true;
    return externalPortalAjax
      .editCustomAddressSuffix({
        appId,
        customAddressSuffix: urlSuffix,
      })
      .then(res => {
        switch (res.resultEnum) {
          case 1:
            cb && cb(res.portalUrl);
            break;
          case 2:
            setState({
              errStr: _l('此名称已被占用'),
            });
            break;
          case 3:
            setState({
              errStr: _l('此名称和系统地址冲突，请重新输入'),
            });
            break;
          default:
            alert(_l('操作失败，请稍后再试'), 3);
            break;
        }
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 3);
      })
      .finally(() => {
        requestPending.current = false;
        setState({ loading: false });
      });
  };

  const handleOk = () => {
    if (props.urlSuffix === urlSuffix) {
      onCancel();
      return;
    }

    if (errStr) {
      alert(_l('请正确输入后缀'), 2);
      return;
    }

    setState({ loading: true });
    return editAddressSuffix(url => {
      onOk(urlSuffix, url);
    });
  };

  const handleCancel = () => {
    if (!requestPending.current) onCancel();
  };

  return (
    <Modal
      title={_l('自定义域名')}
      open={props.show}
      width={640}
      okText={_l('确认')}
      cancelText={_l('取消')}
      confirmLoading={loading}
      mask={{ closable: !loading }}
      keyboard={!loading}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Wrap>
        <p className="textSecondary">{_l('可定义域名后缀，支持输入字母、数字、中划线')}</p>
        <div className="urlInput flexRow">
          <span className="urlPre">{urlPre}</span>
          <input
            className="flex"
            value={urlSuffix}
            maxLength={60} //最大60个字
            onChange={e => {
              const str = e.target.value.trim().replace(/[^\w-]|_/gi, '');
              setState({ urlSuffix: str, errStr: '' });
            }}
            onBlur={e => {
              if (e.target.value.trim()) {
                verify(urlSuffix);
              }
            }}
          />
        </div>
        {!!errStr && <span className="Red errTxt mTop5 InlineBlock">{errStr}</span>}
      </Wrap>
    </Modal>
  );
}
