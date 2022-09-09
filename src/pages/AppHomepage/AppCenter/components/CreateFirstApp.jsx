import React, { Fragment } from 'react';
import styled from 'styled-components';
import { createApp } from 'api/homeApp';
import { navigateTo } from 'router/navigateTo';
import { COLORS } from 'src/pages/AppHomepage/components/SelectIcon/config';
import bgPng from '../assets/welcome.png';

const FullCon = styled.div`
  flex: 1;
  padding-top: 160px;
  background: #fff;
  text-align: center;
  .welcomeImg {
    height: 100px;
  }
  h2 {
    font-size: 32px;
  }
  & > p {
    color: #333;
  }
  .introWrap {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
  .introItem {
    width: 250px;
    height: 266px;
    padding: 40px 32px 56px 32px;
    background-color: #fff;
    border: 1px solid #eceef1;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 0px 2px rgba(0, 0, 0, 0.12);
    }
    &:nth-child(2) {
      margin: 0 32px;
    }
    .iconWrap {
      font-size: 40px;
    }
    .title {
      margin-top: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    .desc {
      margin-top: 8px;
      color: #757575;
    }
  }
`;

export default function NoProjectsStatus(props) {
  const { projectId } = props;
  const project = _.find(md.global.Account.projects, { projectId });
  const canCreate = !_.get(project, 'cannotCreateApp');
  const INTRO_CONFIG = [
    {
      type: 'create',
      icon: 'add',
      iconColor: '#2196f3',
      title: _l('创建空白应用'),
      desc: _l('从头开始创造您自己的应用'),
      key: 'addAppIcon',
    },
    {
      icon: 'custom_store',
      iconColor: '#3cca8e',
      title: _l('从应用库安装'),
      desc: _l('安装应用库中现成的开箱模板，您可以直接使用，也可以继续按需修改'),
      href: `/app/lib?projectId=${projectId}`,
      key: 'installFromLib',
    },
  ].filter(data => {
    return data.key === 'installFromLib' ? !md.global.SysSettings.hideTemplateLibrary : true;
  });
  return (
    <FullCon>
      <div className="welcomeImg">
        <img src={bgPng} />
      </div>
      <h2>{_l('欢迎使用')}</h2>
      {canCreate && (
        <Fragment>
          <p className="Font17">{_l('现在，从创建一个应用开始吧')}</p>
          <div className="introWrap">
            {INTRO_CONFIG.map(({ type, icon, iconColor, title, desc, href }) => (
              <div
                className="introItem"
                onClick={() => {
                  if (type === 'create') {
                    createApp({
                      projectId,
                      name: _l('未命名应用'),
                      icon: '0_lego',
                      iconColor: COLORS[_.random(0, COLORS.length - 1)],
                      permissionType: 200,
                    }).then(res => {
                      navigateTo(`/app/${res.id}`);
                    });
                    return;
                  }
                  if (type === 'solution') {
                    navigateTo(href, '__blank');
                    return;
                  }

                  navigateTo(href);
                }}
              >
                <div className="iconWrap">
                  <i className={`icon-${icon}`} style={{ color: iconColor }} />
                </div>
                <div className="title">
                  {title}
                  {type === 'solution' && <i className="icon-launch Font12" style={{ verticalAlign: 'super' }} />}
                </div>
                <div className="desc">{desc}</div>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </FullCon>
  );
}
