import React, { useEffect, useState } from 'react';
import homeAppApi from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import processVersionApi from 'src/pages/workflow/api/processVersion';
import { TYPES } from 'src/pages/workflow/WorkflowList/utils';
import { SidebarWrap } from './styled';

const Wrap = styled.div`
  .appIcon {
    width: 28px;
    height: 28px;
    justify-content: center;
    border-radius: 4px;
  }
`;

const SelectApp = props => {
  const { app = {}, onChange, validProject, onClose } = props;
  const selectAppId = app.id;
  return (
    <SidebarWrap className="flexColumn">
      <div className="flexRow alignItemsCenter">
        <div className="flexRow alignItemsCenter flex">
          <Icon icon="backspace" className="Gray_9e Font20 mRight10" onClick={onClose} />
          <div className="Gray_9e Font13 flex ellipsis">{_l('应用')}</div>
        </div>
        <Icon icon="close" className="Gray_9e close" onClick={onClose} />
      </div>
      <div className="flex overflowY mTop10">
        {validProject.map(item => (
          <div key={item.projectId} className="mBottom20">
            <div className="Gray_75">{item.projectName}</div>
            {item.projectApps.map(app => (
              <div
                key={app.id}
                className="appItem flexRow alignItemsCenter pTop10 pBottom10"
                onClick={() => {
                  onChange(app);
                  onClose();
                }}
              >
                <div
                  className="appIcon flexRow alignItemsCenter justifyContentCenter"
                  style={{ backgroundColor: app.iconColor }}
                >
                  <SvgIcon url={app.iconUrl} fill="#fff" size={20} />
                </div>
                <div className="flex mLeft10 mRight10 ellipsis Font15">{app.name}</div>
                {selectAppId === app.id && <Icon icon="done" className="ThemeColor Font18" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </SidebarWrap>
  );
};

const SelectProcessType = props => {
  const { processType = {}, onChange, onClose } = props;
  return (
    <SidebarWrap className="flexColumn">
      <div className="flexRow alignItemsCenter">
        <div className="flexRow alignItemsCenter flex">
          <Icon icon="backspace" className="Gray_9e Font20 mRight10" onClick={onClose} />
          <div className="Gray_9e Font13 flex ellipsis">{_l('流程类型')}</div>
        </div>
        <Icon icon="close" className="Gray_9e close" onClick={onClose} />
      </div>
      <div className="flex overflowY mTop10">
        {TYPES.map(item => (
          <div
            key={item.value}
            className="flexRow alignItemsCenter pTop10 pBottom10"
            onClick={() => {
              onChange(item);
              onClose();
            }}
          >
            <i className={`icon ${item.icon} Gray_9e Font22 mRight5`} />
            <div className="flex mLeft10 mRight10 ellipsis Font14">{item.text}</div>
            {processType.value === item.value && <Icon icon="done" className="ThemeColor Font18" />}
          </div>
        ))}
      </div>
    </SidebarWrap>
  );
};

const SelectProcess = props => {
  const { processList, process = {}, onChange, onClose } = props;
  return (
    <SidebarWrap className="flexColumn">
      <div className="flexRow alignItemsCenter">
        <div className="flexRow alignItemsCenter flex">
          <Icon icon="backspace" className="Gray_9e Font20 mRight10" onClick={onClose} />
          <div className="Gray_9e Font13 flex ellipsis">{_l('流程')}</div>
        </div>
        <Icon icon="close" className="Gray_9e close" onClick={onClose} />
      </div>
      <div className="flex overflowY mTop10">
        {processList.map(item => (
          <div
            key={item.id}
            className="flexRow alignItemsCenter pTop10 pBottom10"
            onClick={() => {
              if (process.id === item.id) {
                onChange({});
              } else {
                onChange(item);
              }
              onClose();
            }}
          >
            <div className="flex mLeft10 mRight10 ellipsis Font14">{item.name}</div>
            {process.id === item.id && <Icon icon="done" className="ThemeColor Font18" />}
          </div>
        ))}
        {!processList.length && <div className="centerAlign mTop20">{_l('暂无数据')}</div>}
      </div>
    </SidebarWrap>
  );
};

export default props => {
  const { visible, requestAppId, apkId, onChange } = props;
  const [loading, setLoading] = useState(true);
  const [selectInfo, setSelectInfo] = useState({});
  const [validProject, setValidProject] = useState([]);
  const [processList, setProcessList] = useState([]);
  const [appVisible, setAppVisible] = useState(false);
  const [processTypeVisible, setProcessTypeVisible] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const processType = _.get(selectInfo, 'processType.value');
  const currentSelectAppId = apkId || requestAppId;

  useEffect(() => {
    if (visible && !selectInfo.app) {
      setLoading(true);
      homeAppApi.getAllHomeApp().then(data => {
        const list = data.validProject.filter(item => item.projectApps.length);
        if (requestAppId) {
          const apps = _.flatten(list.map(item => item.projectApps));
          const app = _.find(apps, { id: requestAppId });
          setSelectInfo({
            app,
            processType: undefined,
            process: undefined,
          });
          onChange({ apkId: app.id, processId: undefined });
        }
        setValidProject(list);
        setLoading(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (_.isString(processType)) {
      let request = null;
      if (processType) {
        request = processVersionApi.list;
      } else {
        request = processVersionApi.listAll;
      }
      request({
        relationId: currentSelectAppId,
        processListType: processType || undefined,
      }).then(data => {
        setProcessList(_.flatten(data.map(n => n.processList)));
      });
    }
  }, [processType]);

  useEffect(() => {
    if (!apkId) {
      setSelectInfo({});
    }
  }, [apkId]);

  return (
    <Wrap className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('应用筛选')}</div>
      {loading ? (
        <LoadDiv size="middle" />
      ) : (
        <div>
          <div className="flexRow alignItemsCenter pBottom10" onClick={() => !requestAppId && setAppVisible(true)}>
            <div className={cx('flex Font14 bold', { Gray_9e: !_.get(selectInfo, 'app.id') })}>{_l('应用')}</div>
            <div className="flexRow alignItemsCenter flex justifyContentRight">
              <div className="ThemeColor ellipsis">{_.get(selectInfo, 'app.name')}</div>
              {!requestAppId && <Icon icon="arrow-right-border" className="Font18 Gray_c6" />}
            </div>
          </div>
          {appVisible && (
            <SelectApp
              app={selectInfo.app}
              onChange={app => {
                setSelectInfo(values => ({ ...values, app, processType: undefined, process: undefined }));
                onChange({ apkId: app.id, processId: undefined });
              }}
              validProject={validProject}
              onClose={() => setAppVisible(false)}
            />
          )}
          {_.get(selectInfo, 'app.id') && (
            <div className="flexRow alignItemsCenter pTop10 pBottom10" onClick={() => setProcessTypeVisible(true)}>
              <div className={cx('flex Font14 bold', { Gray_9e: !_.get(selectInfo, 'processType.text') })}>
                {_l('流程类型')}
              </div>
              <div className="flexRow alignItemsCenter">
                <div className="ThemeColor ellipsis">{_.get(selectInfo, 'processType.text')}</div>
                <Icon icon="arrow-right-border" className="Font18 Gray_c6" />
              </div>
            </div>
          )}
          {processTypeVisible && (
            <SelectProcessType
              processType={selectInfo.processType}
              onChange={processType => {
                setSelectInfo(values => ({ ...values, processType, process: undefined }));
                onChange({ processId: undefined });
              }}
              onClose={() => setProcessTypeVisible(false)}
            />
          )}
          {_.isString(processType) && (
            <div className="flexRow alignItemsCenter pTop10 pBottom10" onClick={() => setProcessVisible(true)}>
              <div className={cx('flex Font14 bold', { Gray_9e: false })}>{_l('流程')}</div>
              <div className="flexRow alignItemsCenter flex justifyContentRight">
                <div className="ThemeColor ellipsis">{_.get(selectInfo, 'process.name')}</div>
                <Icon icon="arrow-right-border" className="Font18 Gray_c6" />
              </div>
            </div>
          )}
          {processVisible && (
            <SelectProcess
              processList={processList}
              process={selectInfo.process}
              onChange={process => {
                setSelectInfo(values => ({ ...values, process }));
                onChange({ processId: process.id });
              }}
              onClose={() => setProcessVisible(false)}
            />
          )}
        </div>
      )}
    </Wrap>
  );
};
