import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import homeAppAjax from 'src/api/homeApp';
import { navigateTo } from 'router/navigateTo';
import { COLORS } from 'src/pages/AppHomepage/components/SelectIcon/config';
import DialogImportExcelCreate from 'src/pages/worksheet/components/DialogImportExcelCreate';
import bgPng from '../assets/welcome.png';
import _ from 'lodash';

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
      icon: 'addapplication2',
      iconColor: '#2196f3',
      title: _l('创建空白应用'),
      desc: _l('从头开始创造您自己的应用'),
      key: 'addAppIcon',
    },
    {
      icon: 'custom_store',
      iconColor: '#FAAF55',
      title: _l('从应用库安装'),
      desc: _l('安装应用库中现成的开箱模板，您可以直接使用，也可以继续按需修改'),
      href: `/app/lib?projectId=${projectId}`,
      key: 'installFromLib',
    },
    {
      type: 'excel_create',
      icon: 'new_excel',
      iconColor: '#78B84C',
      title: _l('从Excel创建应用'),
      desc: _l('上传Excel文件创建您的应用'),
      // href: '#',
    },
  ].filter(data => {
    return data.key === 'installFromLib' ? !md.global.SysSettings.hideTemplateLibrary : true;
  });
  let [dialogImportExcel, setDialogImportExcel] = useState(false);
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
                  if (type === 'excel_create') {
                    console.log('excel_create');
                    setDialogImportExcel(true);
                    return;
                  }
                  if (type === 'create') {
                    homeAppAjax
                      .createApp({
                        projectId,
                        name: _l('未命名应用'),
                        icon: '0_lego',
                        iconColor: COLORS[_.random(0, COLORS.length - 1)],
                        permissionType: 200,
                      })
                      .then(res => {
                        switch (res.state) {
                          case 1:
                            const data = res.data || {};
                            navigateTo(`/app/${data.id}`);
                            break;
                          case 3:
                            alert(_l('目标分组不存在！'), 2);
                            break;
                          case 4:
                            alert(_l('没有创建权限！'), 2);
                            break;
                          default:
                            alert(_l('新建应用失败！'), 2);
                            break;
                        }
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
      {dialogImportExcel && (
        <DialogImportExcelCreate projectId={projectId} onCancel={() => setDialogImportExcel(false)} createType="app" />
      )}
    </FullCon>
  );
}
