import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Support, Icon, Tooltip, Modal } from 'ming-ui';
import _ from 'lodash';
import { Select } from 'antd';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import appManagement from 'src/api/appManagement';
import './EditUserExtendInfo.less';

const EditUserExtendInfoCon = styled.div`
  .selectWorksheet,
  .selectControl {
    width: 560px;
    height: 36px;
  }
  .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
    box-shadow: unset;
  }
  .saveBtn {
    border: none;
    height: 36px;
    padding: 0 30px;
    color: #fff;
    line-height: 36px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 400;
    -webkit-transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
    background: #1e88e5;
    cursor: pointer;
  }
  .saveBtn:hover {
    background: #1565c0;
  }
  .clearBtn {
    background: #fff;
    color: #333;
    font-weight: 400;
    border: 1px solid #eaeaea;
  }
  .clearBtn:hover {
    border: 1px solid #ccc;
    background: #fff !important;
  }
  .buttons {
    width: 560px;
  }
  .cancelBtn {
    float: right;
    cursor: pointer;
    color: #f44336;
    background: #fff;
    border: 1px solid #f44336;
  }
  .cancelBtn:hover {
    background: rgba(244, 67, 54, 0.05);
  }
`;

export default function EditUserExtendInfo(props) {
  const { step, appId, onChangeStep, value, onChangeData, result, appProjectId } = props;

  const [dialogVisible, setDialogVisible] = useState(false);
  const [appList, setAppList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [worksheetList, setWorksheetList] = useState([]);
  const [controls, setControls] = useState([]);
  const [appName, setAppName] = useState('');
  const [data, setData] = useState({
    worksheetId: value.worksheetId || undefined,
    controlId: value.controlId || undefined,
    appId: value.appId || appId || undefined,
    status: value.status || 1,
  });

  useEffect(() => {
    setLoading(true);
    appId && homeAppAjax.getApiInfo({ appId: appId }).then(res => setAppName(res.apiResponse.name));
    appManagement
      .getAppForManager({
        projectId: appProjectId || localStorage.getItem('currentProjectId') || md.global.Account.projects[0].projectId,
      })
      .then(data => setAppList(data));
  }, []);

  useEffect(() => {
    if (!data.appId) return;
    homeAppAjax
      .getWorksheetsByAppId({ type: 0, appId: data.appId })
      .then(data => {
        setWorksheetList(data);
        setLoading(false);
      })
      .fail(err => setLoading(false));
  }, [data.appId]);

  useEffect(() => {
    if (!data.worksheetId) return;
    setLoading(true);
    worksheetAjax
      .getWorksheetInfo({ worksheetId: data.worksheetId, getTemplate: true, getViews: false, getRules: true })
      .then(res => {
        setLoading(false);
        setControls(
          res.template.controls.filter(
            l => l.controlId.length > 20 && l.type === 26 && _.get(l, 'advancedSetting.usertype') !== '2',
          ),
        );
      })
      .fail(err => setLoading(false));
  }, [data.worksheetId]);

  const saveFn = statusFlag => {
    if (statusFlag === 9 && !data.controlId) {
      return alert(_l('无扩展信息表'), 3);
    }
    if (!data.appId) {
      return alert(_l('请选择应用'), 3);
    }
    if (!data.worksheetId) {
      return alert(_l('请选择工作表'), 3);
    }
    if (!data.controlId) {
      return alert(_l('请选择用户映射'), 3);
    }
    worksheetAjax
      .saveAppExtendAttr({
        appId: appId,
        worksheetId: data.worksheetId,
        userControlId: data.controlId,
        extendAttrs: [],
        status: statusFlag || 1,
      })
      .then(res => {
        if (res) {
          onChangeData();
          onChangeStep(statusFlag === 9 ? 0 : 3);
          alert(statusFlag === 9 ? _l('已停用') : _l('保存成功'));
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .fail(err => alert(err));
  };

  return (
    <EditUserExtendInfoCon>
      <h2 className="mTop35 Font17 mBottom0">{_l('%0用户扩展信息表', step === 1 ? '建立' : '编辑')}</h2>
      <div className="userExtendInfo-desc Gray_9e mTop13">
        {_l(
          '通过工作表管理应用成员额外的扩展信息字段，在角色权限、筛选器中可以使用用户的扩展信息字段来作为动态筛选条件',
        )}
        <Support className="help" type={3} href="https://help.mingdao.com/user4" text={_l('帮助')} />
      </div>
      <div className="selectTitle Bold valignWrapper mTop30">{_l('选择应用')}</div>
      <Select
        showSearch
        className="selectWorksheet mTop8"
        loading={loading}
        placeholder={_l('选择应用')}
        optionFilterProp="workSheetName"
        filterOption={(input, option) => (option.children || '').toLowerCase().includes(input.toLowerCase())}
        value={
          appList.find(l => l.appId === data.appId)
            ? data.appId
            : result
            ? result.appNameOfWorksheet
            : appList.length === 0
            ? undefined
            : appName || appId
        }
        onSelect={value => setData({ ...data, appId: value, worksheetId: '', controlId: '' })}
        notFoundContent={<span>{_l('无应用')}</span>}
      >
        {appList.map(item => (
          <Select.Option key={item.appId} value={item.appId}>
            {item.appName ? `${item.appName}${appId === item.appId ? _l('（本应用）') : ''}` : ''}
          </Select.Option>
        ))}
      </Select>
      <div className="selectTitle Bold valignWrapper mTop20">
        {_l('选择工作表')}
        <Tooltip text={_l('选择或新建的工作表字段中，必须包含“成员”字段')}>
          <Icon icon="info_outline" className="mLeft6 Gray_bd Font17" />
        </Tooltip>
      </div>
      <Select
        showSearch
        className="selectWorksheet mTop8"
        loading={loading}
        placeholder={_l('选择工作表')}
        optionFilterProp="workSheetName"
        filterOption={(input, option) => (option.children || '').toLowerCase().includes(input.toLowerCase())}
        value={
          worksheetList.find(l => l.workSheetId === data.worksheetId)
            ? data.worksheetId
            : data.worksheetId
            ? result
              ? result.worksheetName
              : undefined
            : undefined
        }
        onSelect={value => setData({ ...data, worksheetId: value, controlId: '' })}
        notFoundContent={<span>{_l('该应用无工作表')}</span>}
      >
        {worksheetList.map(item => (
          <Select.Option key={item.workSheetId} value={item.workSheetId}>
            {item.workSheetName || ''}
          </Select.Option>
        ))}
      </Select>
      <div className="selectTitle Bold valignWrapper mTop20">
        {_l('用户映射')}
        <Tooltip text={_l('选择一个“成员”字段，用于标识匹配系统登陆的用户，进而读取用户关联的扩展属性')}>
          <Icon icon="info_outline" className="mLeft6 Gray_bd Font17" />
        </Tooltip>
      </div>
      <Select
        showSearch
        className="selectControl mTop8"
        loading={loading}
        placeholder={_l('选择用户映射')}
        optionFilterProp="controlName"
        filterOption={(input, option) => (option.children || '').toLowerCase().includes(input.toLowerCase())}
        value={controls.find(l => l.controlId === data.controlId) ? data.controlId : undefined}
        onSelect={value => setData({ ...data, controlId: value })}
        notFoundContent={<span>{data.worksheetId ? _l('该工作表无"成员"字段') : _l('请先选择工作表')}</span>}
      >
        {controls.map(item => (
          <Select.Option key={item.controlId} value={item.controlId}>
            {item.controlName}
          </Select.Option>
        ))}
      </Select>
      <div className="mTop30 buttons">
        <button className="saveBtn mRight20" onClick={() => saveFn(1)}>
          {_l('保存')}
        </button>
        <button
          className="clearBtn saveBtn"
          onClick={() => {
            let status = _.get(result, ['appExtendAttr', 'status']);
            onChangeStep(status ? (status === 9 ? 0 : 3) : 0);
          }}
        >
          {_l('取消')}
        </button>
        {step !== 1 && (
          <span className="cancelBtn saveBtn" onClick={() => setDialogVisible(true)}>
            {_l('停用')}
          </span>
        )}
      </div>
      {dialogVisible && (
        <Modal
          className="cancelUserExtendInfo"
          width={494}
          title={<span style={{ color: '#f44336', fontWeight: 600 }}>{_l('停用用户扩展信息表')}</span>}
          visible={dialogVisible}
          okText={_l('停用')}
          cancelText={_l('取消')}
          onCancel={() => {
            setDialogVisible(false);
          }}
          onOk={() => {
            saveFn(9);
          }}
        >
          <p className="modalText">{_l('删除用户扩展信息表后，用户角色权限中的权限标签都将失效 是否确认取消？')}</p>
        </Modal>
      )}
    </EditUserExtendInfoCon>
  );
}
