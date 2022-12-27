import React, { useEffect, useState } from 'react';
import { Dialog, Switch, Radio } from 'ming-ui';
import { Select } from 'antd';
import privateSysSetting from 'src/api/privateSysSetting';
import styled from 'styled-components';
import { Fragment } from 'react';

const Line = styled.div`
  border-bottom: 1px solid #eaeaea;
  margin: 20px 0;
`;
const SetButton = styled.div`
  width: 70px;
  height: 28px;
  text-align: center;
  line-height: 26px;
  border-radius: 3px 3px 3px 3px;
  border: 1px solid #2196f3;
  margin-top: 20px;
  cursor: pointer;
  color: #2196f3;
`;

const Wrap = styled.div`
  .ant-select-selection-item {
    .companyName {
      flex: 0 !important;
    }
  }
`;

export default function AppLibrary(props) {
  const [templateLibraryTypes, setTemplateLibraryTypes] = useState(md.global.SysSettings.templateLibraryTypes);
  const [hideTemplateLibrary, setHideTemplateLibrary] = useState(md.global.SysSettings.hideTemplateLibrary);
  const [visible, setVisible] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [approvalProject, setApprovalProject] = useState({});
  const [selectProject, setSelectProject] = useState({});

  useEffect(() => {
    if (templateLibraryTypes === '2') {
      getProject();
    }
  }, []);

  const updateSysSettings = (config, cb) => {
    privateSysSetting
      .editSysSettings({
        settings: config,
      })
      .then(res => {
        if (res) {
          alert(_l('修改成功'), 1);
          cb && cb();
        }
      });
  };

  const getProjectList = () => {
    privateSysSetting
      .getProjects({
        keywords: '',
        pageSize: 20,
      })
      .then(res => {
        setProjectList(res);
      });
  };

  const getProject = () => {
    if (!md.global.SysSettings.templateLibraryAuditProjectId) return;
    privateSysSetting
      .getProject({
        projectId: md.global.SysSettings.templateLibraryAuditProjectId,
      })
      .then(res => {
        setApprovalProject(res);
        setSelectProject(res);
      });
  };

  const onChange = value => {
    const temp = _.find(projectList, it => it.projectId === value);
    setSelectProject(temp);
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('应用库')}</div>
      <div className="flexRow">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('选项配置')}</div>
          <div className="Gray_9e mBottom30">{_l('配置应用库是否关闭，启用自建应用库还是明道云共有应用库')}</div>
        </div>
        <Switch
          checked={!hideTemplateLibrary}
          onClick={value => {
            updateSysSettings({ hideTemplateLibrary: value }, () => {
              getProject();
              md.global.SysSettings.hideTemplateLibrary = value;
              setHideTemplateLibrary(value);
            });
          }}
        />
      </div>
      {!hideTemplateLibrary && (
        <Fragment>
          <div className="flexRow">
            {[{ text: _l('自建应用库'), value: '2' }, { text: _l('明道云应用库'), value: '1' }].map((item, index) => (
              <div className="mRight30">
                <Radio
                  key={index}
                  text={item.text}
                  checked={templateLibraryTypes === item.value}
                  onClick={() => {
                    if (item.value === templateLibraryTypes) return;

                    if (item.value === '2') {
                      getProject();
                    }

                    updateSysSettings({ templateLibraryTypes: item.value }, () => {
                      md.global.SysSettings.templateLibraryTypes = item.value;
                      setTemplateLibraryTypes(item.value);
                    });
                  }}
                />
              </div>
            ))}
          </div>

          {templateLibraryTypes === '2' && (
            <Fragment>
              <Line />
              <div className="Font14 bold mBottom20">{_l('应用发布审批组织')}</div>
              <div>
                <span className="Gray_75 mRight40">{_l('审批组织')}</span>
                <span>{approvalProject.companyName}</span>
                <span className="Gray_9e mLeft10">{approvalProject.projectCode}</span>
              </div>
              <SetButton
                onClick={() => {
                  getProjectList();
                  setVisible(true);
                }}
              >
                {_l('设置')}
              </SetButton>
            </Fragment>
          )}
        </Fragment>
      )}
      <Dialog
        className="setAprrovalOrg"
        dialogBoxID="setAprrovalOrg"
        title={_l('设置审批组织')}
        visible={visible}
        okText={_l('保存')}
        onCancel={() => setVisible(false)}
        onOk={() => {
          updateSysSettings({ templateLibraryAuditProjectId: selectProject.projectId }, () => {
            md.global.SysSettings.templateLibraryAuditProjectId = selectProject.projectId;
            setVisible(false);
            setApprovalProject(selectProject);
          });
        }}
      >
        <Wrap>
          <div className="Font14 mBottom10">{_l('选择组织')}</div>
          <Select
            style={{ width: '100%' }}
            value={selectProject.projectId}
            showSearch
            placeholder="请选择"
            onChange={onChange}
            filterOption={(input, option) => (option.label || '').toLowerCase().includes(input.toLowerCase())}
          >
            {projectList.map(it => {
              return (
                <Select.Option key={it.projectId} value={it.projectId} label={it.companyName}>
                  <div className="flexRow">
                    <div className="flex companyName mRight5">{it.companyName}</div>
                    <div className="Gray_9e">{it.projectCode}</div>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </Wrap>
      </Dialog>
    </div>
  );
}
