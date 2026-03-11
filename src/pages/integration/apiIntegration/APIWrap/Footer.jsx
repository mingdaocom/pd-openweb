import React from 'react';
import styled from 'styled-components';
import Switch from 'src/pages/workflow/components/Switch';
import { BtnWrap } from '../style';

const FooterCon = styled.div`
  height: 70px;
  background: var(--color-background-primary);
  padding: 16px 40px;
  .boc {
    max-width: 800px;
    .close {
      height: 38px;
      border-radius: 3px;
      line-height: 38px;
      color: var(--color-text-secondary);
      padding: 0 30px;
      border: 1px solid var(--color-border-secondary);
      &:hover {
        color: var(--color-primary);
        border: 1px solid var(--color-primary);
      }
    }
  }
  .apiBtn {
    height: 36px;
    line-height: 36px;
    color: var(--color-white);
    padding: 0 32px;
    border-radius: 3px;
  }
  .update {
    height: 38px;
    border-radius: 3px;
    line-height: 38px;
    color: var(--color-primary);
    padding: 0 30px;
    border: 1px solid var(--color-primary);
    &:hover {
      color: var(--color-link-hover);
      border: 1px solid var(--color-link-hover);
    }
  }
`;

function Footer({ data, apkInfo, isConnectOwner, pending, onCancel, switchStatus, setState }) {
  return (
    <FooterCon className="flexRow w100">
      <div className="boc flexRow divCenter w100">
        <div className="flex">
          <div
            className="InlineBlock close Hand"
            onClick={() => {
              if (location.href.indexOf('/integrationApi') >= 0) {
                location.href = '/integration';
              } else {
                onCancel && onCancel();
              }
            }}
          >
            {_l('关闭')}
          </div>
        </div>
        {isConnectOwner ? (
          // {/* 安装的连接均没有「更新发布」功能。 超级管理员或拥有者 */}
          data.publish || apkInfo.type === 2 ? (
            <React.Fragment>
              {/* data.publishStatus === 1 && data.enabled 有修改未更新 */}
              {data.publishStatus === 1 && data.enabled && apkInfo.type === 1 && (
                <div
                  className="InlineBlock update mRight10 Hand"
                  onClick={() =>
                    switchStatus(true, () => {
                      setState({
                        data: { ...data, publishStatus: 2 },
                      });
                      alert(_l('更新成功'));
                    })
                  }
                >
                  {_l('更新发布')}
                </div>
              )}
              <Switch
                status={data.enabled ? 'active' : 'close'}
                pending={pending}
                isRefresh={false}
                switchStatus={() => switchStatus(!data.enabled)}
              />
            </React.Fragment>
          ) : (
            apkInfo.type === 1 && (
              <BtnWrap
                className="apiBtn InlineBlock Hand"
                onClick={() =>
                  switchStatus(true, () => {
                    setState({
                      data: { ...data, publish: true, enabled: true, publishStatus: 2 },
                    });
                  })
                }
              >
                {_l('发布 API')}
              </BtnWrap>
            )
          )
        ) : null}
      </div>
    </FooterCon>
  );
}

export default Footer;
