import React, { useEffect, useRef, useState } from 'react';
import { Icon, Input, Support } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import { updateViewAdvancedSetting } from '../../util';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { Tooltip } from 'antd';

const ParamsWrapper = styled.div`
  margin-top: 20px;

  .icon-delete1 {
    font-size: 16px;
    color: #9e9e9e;
    margin-left: 16px;
    cursor: pointer;
    &:hover {
      color: #f44336;
    }
  }

  .ming.Input {
    border-color: #ddd;
  }
  input::-webkit-input-placeholder {
    color: #9e9e9e;
  }
  input::-ms-input-placeholder {
    color: #9e9e9e;
  }
  input::-moz-placeholder {
    color: #9e9e9e;
  }
  .ming.Input:focus {
    border-color: #2196f3 !important;
  }
  .repeatItem {
    border-color: red !important;
  }
`;

const AddParamsBtn = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  margin-top: 20px;
  cursor: pointer;
  color: #757575;
  i {
    font-size: 18px;
    margin-right: 4px;
  }
  span {
    font-weight: bold;
  }

  &:hover {
    color: #2196f3;
  }
`;

const LinkText = styled.span`
  color: #1e88e5;
  cursor: pointer;
  &:hover {
    color: #1565c0 !important;
  }
`;

export default function UrlParams(props) {
  const { view = {}, updateCurrentView, appId, worksheetId, currentSheetInfo, sheetSwitchPermit, hasCharge } = props;
  const [params, setParams] = useState(JSON.parse((view.advancedSetting || {}).urlparams || '[]'));
  const [flag, setFlag] = useState(false);
  const paramsRef = useRef();

  useEffect(() => {
    if (paramsRef && paramsRef.current && paramsRef.current.lastChild && paramsRef.current.lastChild.firstChild) {
      paramsRef.current.lastChild.firstChild.focus();
    }
  }, [flag]);

  const onUpdateView = newParams => {
    newParams = _.uniq(newParams.filter(item => item.trim() && item.trim().length <= 20));

    updateCurrentView({
      ...view,
      appId,
      advancedSetting: { urlparams: JSON.stringify(newParams) },
      editAttrs: ['advancedSetting'],
      editAdKeys: ['urlparams'],
    });
  };

  const onValidate = index => {
    const currentValue = params[index];

    if (!currentValue.trim()) {
      alert(_l('参数名不能为空'), 3);
      return;
    }

    if (params.filter(p => p === currentValue).length > 1) {
      alert(_l('参数重复'), 3);
      return;
    }
  };

  return (
    <div>
      <div className="Gray_75 mTop8">
        <span>{_l('指定参数名，可作为查询字符串附加在')}</span>

        <LinkText
          onClick={() =>
            openShareDialog({
              from: 'view',
              isCharge: hasCharge,
              title: _l('分享视图'),
              isPublic: view.shareRange === 2,
              hidePublicShare: !(
                isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, view.viewId) && !md.global.Account.isPortal
              ),
              privateShare: isOpenPermit(permitList.internalAccessLink, sheetSwitchPermit, view.viewId),
              params: {
                appId,
                worksheetId,
                viewId: view.viewId,
                title: view.name,
              },
              getCopyContent: (type, url) =>
                type === 'private' ? url : `${url} ${currentSheetInfo.name}-${view.name}`,
              onUpdate: value => {
                updateCurrentView({ ...view, ...value, editAttrs: Object.keys(value) });
              },
            })
          }
        >
          {_l('视图链接')}
        </LinkText>
        <span>{_l('后。在加载页面时可动态获取参数值用于视图的筛选条件。')}</span>
        <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/view/link-parameter" />
      </div>
      {!!params.length && (
        <ParamsWrapper ref={paramsRef}>
          {params.map((item, index) => {
            return (
              <div key={index} className="flexRow alignItemsCenter mBottom12">
                <Input
                  className="flex"
                  placeholder={_l('请输入参数名')}
                  value={item}
                  maxLength={20}
                  onChange={value => {
                    const newParams = params.map((p, i) => {
                      return i === index ? value : p;
                    });
                    setParams(newParams);
                  }}
                  onBlur={() => {
                    onUpdateView(params);
                    onValidate(index);
                  }}
                />
                <Tooltip title={_l('删除')} placement="top">
                  <Icon
                    icon="delete1"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      const newParams = params.filter((_, i) => i !== index);
                      setParams(newParams);
                      onUpdateView(newParams);
                    }}
                  />
                </Tooltip>
              </div>
            );
          })}
        </ParamsWrapper>
      )}

      <AddParamsBtn
        onClick={() => {
          setParams(params.concat(['']));
          setFlag(!flag);
        }}
      >
        <Icon icon="add" />
        <span>{_l('参数')}</span>
      </AddParamsBtn>
    </div>
  );
}
