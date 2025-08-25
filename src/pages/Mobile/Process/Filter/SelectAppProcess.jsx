import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import instanceVersionApi from 'src/pages/workflow/api/instanceVersion';
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
  const { app = {}, onChange, list, onClose } = props;
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
        {list.map(item => {
          const { app } = item;
          return (
            <div
              key={app.id}
              className="appItem flexRow alignItemsCenter pTop10 pBottom10"
              onClick={() => {
                onChange(item);
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
          );
        })}
      </div>
    </SidebarWrap>
  );
};

const Process = props => {
  const { processId, app, processes, onChange, onClose } = props;
  return (
    <SidebarWrap className="flexColumn">
      <div className="flexRow alignItemsCenter">
        <div className="flexRow alignItemsCenter flex">
          <Icon icon="backspace" className="Gray_9e Font20 mRight10" onClick={onClose} />
          <div className="Gray_9e Font13 flex ellipsis">{app.name}</div>
        </div>
        <Icon icon="close" className="Gray_9e close" onClick={onClose} />
      </div>
      <div className="flex overflowY mTop10">
        {processes.map(item => (
          <div
            key={item.id}
            className="flexRow alignItemsCenter pTop10 pBottom10"
            onClick={() => {
              if (processId === item.id) {
                onChange({
                  processId: undefined,
                });
              } else {
                onChange({
                  apkId: app.id,
                  processId: item.id,
                });
              }
              onClose();
            }}
          >
            <div className="flex ellipsis">{item.name}</div>
            {processId === item.id && <Icon icon="done" className="ThemeColor Font18" />}
          </div>
        ))}
      </div>
    </SidebarWrap>
  );
};

export default props => {
  const { visible, todoListFilterParam, requestAppId, apkId, processId, onChange } = props;
  const [loading, setLoading] = useState(true);
  const [appVisible, setAppVisible] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [list, setList] = useState([]);
  const [app, setApp] = useState(null);
  const currentSelectAppId = apkId || requestAppId;

  useEffect(() => {
    if (visible && _.isEmpty(list)) {
      setLoading(true);
      instanceVersionApi.getTodoListFilter(todoListFilterParam).then(data => {
        if (requestAppId) {
          setApp(_.find(data, { app: { id: requestAppId } }));
        }
        setList(data);
        setLoading(false);
      });
    }
  }, [visible]);

  const selectAppInfo = _.find(list, { app: { id: currentSelectAppId } });
  const selectProcess = selectAppInfo ? _.find(selectAppInfo.processes, { id: processId }) || {} : {};

  return (
    <Wrap className="flexColumn mBottom20">
      <div className="Font14 bold mBottom10 flexRow alignItemsCenter">
        <div>{_l('应用/流程')}</div>
      </div>
      {loading ? (
        <LoadDiv size="middle" />
      ) : (
        <div>
          <div className="flexRow alignItemsCenter pBottom10" onClick={() => !requestAppId && setAppVisible(true)}>
            <div className={cx('flex Font14 bold', { Gray_9e: !_.get(selectAppInfo, 'app.id') })}>{_l('应用')}</div>
            <div className="flexRow alignItemsCenter flex justifyContentRight">
              <div className="ThemeColor ellipsis">{_.get(selectAppInfo, 'app.name')}</div>
              {!requestAppId && <Icon icon="arrow-right-border" className="Font18 Gray_c6" />}
            </div>
          </div>
          {appVisible && (
            <SelectApp
              app={selectAppInfo ? selectAppInfo.app : {}}
              onChange={item => {
                const { app } = item;
                onChange({ apkId: app.id, processId: undefined });
                setApp(item);
              }}
              list={list}
              onClose={() => setAppVisible(false)}
            />
          )}
          {currentSelectAppId && (
            <div className="flexRow alignItemsCenter pTop10 pBottom10" onClick={() => setProcessVisible(true)}>
              <div className={cx('flex Font14 bold', { Gray_9e: false })}>{_l('流程')}</div>
              <div className="flexRow alignItemsCenter flex justifyContentRight">
                <div className="ThemeColor ellipsis">{_.get(selectProcess, 'name')}</div>
                <Icon icon="arrow-right-border" className="Font18 Gray_c6" />
              </div>
            </div>
          )}
          {processVisible && (
            <Process
              processId={processId}
              app={app.app}
              processes={app.processes}
              onChange={onChange}
              onClose={() => setProcessVisible(false)}
            />
          )}
        </div>
      )}
    </Wrap>
  );
};
