import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Dialog, Button } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal.js';

import cx from 'classnames';
import _ from 'lodash';
const Load = styled.div`
  width: 15px;
  height: 15px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 100%;
  animation: circle infinite 0.75s linear;
  display: inline-block;
  @keyframes circle {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
const Wrap = styled.div`
  .urlPre {
    background: #dddddd;
    border: 1px solid #ddd;
    line-height: 34px;
    padding: 0 10px;
    border-radius: 3px 0 0 3px;
    // width: 197px;
  }
  input {
    border-radius: 0 3px 3px 0;
    border: 1px solid #ddd;
    line-height: 34px;
    padding: 0 5px;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .errTxt {
    // margin-left: 197px;
  }
`;
// 不能以中划线开头或结束（前端校验）
// 至少包含4位字母或数字（前端校验）
// 只能输入数字、字母、中划线（前端校验）
// 重复校验（点击确定按钮，或失焦时校验） 提示：此名称已被占用
// 不能和HAP地址冲突（点击确定按钮，或失焦时校验，提示：此名称和系统地址冲突，请重新输入
export default function EditPortalUrlDialog(props) {
  const { onOk, onCancel, urlPre, appId } = props;
  const inputRef = useRef(null);
  const [{ urlSuffix, loading, errStr }, setState] = useSetState({
    urlSuffix: props.urlSuffix,
    loading: false,
    errStr: '',
  });
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
  const editAddressSuffix = _.debounce(cb => {
    externalPortalAjax
      .editCustomAddressSuffix({
        appId,
        customAddressSuffix: urlSuffix,
      })
      .then(res => {
        setState({
          loading: false,
        });
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
      });
  }, 500);
  return (
    <Dialog
      title={_l('自定义域名')}
      className={cx('')}
      headerClass=""
      bodyClass=""
      onCancel={onCancel}
      visible={props.show}
      width={640}
      footer={
        <React.Fragment>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            className={cx({ Alpha5: !!errStr || loading })}
            onClick={() => {
              if (props.urlSuffix === urlSuffix) {
                return onCancel();
              }
              if (!errStr) {
                setState({
                  loading: true,
                });
                editAddressSuffix(url => {
                  onOk(urlSuffix, url);
                });
              } else {
                alert(_l('请正确输入后缀'), 2);
                return;
              }
            }}
          >
            {loading ? <Load class="loading"></Load> : _l('确认')}
          </Button>
        </React.Fragment>
      }
    >
      <Wrap>
        <p className="Gray_75">{_l('可定义域名后缀，支持输入字母、数字、中划线')}</p>
        <div className="urlInput flexRow">
          <span className="urlPre">{urlPre}</span>
          <input
            className="flex"
            value={urlSuffix}
            maxLength={'60'} //最大60个字
            ref={inputRef}
            onChange={e => {
              const str = e.target.value.trim().replace(/[^\w-]|_/gi, '');
              setState({ urlSuffix: str, errStr: '' });
            }}
            onBlur={e => {
              if (!!e.target.value.trim()) {
                verify(urlSuffix);
              }
            }}
          />
        </div>
        {!!errStr && <span className="Red errTxt mTop5 InlineBlock">{errStr}</span>}
      </Wrap>
    </Dialog>
  );
}
