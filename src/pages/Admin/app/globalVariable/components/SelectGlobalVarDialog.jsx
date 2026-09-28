import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { SearchInput } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import variableApi from 'src/api/variable';
import GlobalVarTable from './GlobalVarTable';

const SelectVarModal = styled(Modal)`
  position: relative;
  .selectVarWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    .searchCon {
      width: 100%;
      height: 36px;
    }
    .tabWrap {
      display: flex;
      border-bottom: 1px solid var(--color-border-secondary);
      .tabItem {
        padding: 0 20px;
        height: 48px;
        line-height: 48px;
        font-size: 14px;
        font-weight: 600;
        &:last-child {
          margin-left: 32px;
        }
        &.active {
          border-bottom: 3px solid var(--color-primary);
          color: var(--color-primary);
        }
      }
    }
  }
`;

const tabInfos = [
  { label: _l('应用'), value: 'app' },
  { label: _l('组织'), value: 'project' },
];

function SelectGlobalVar(props) {
  const { onOk, onClose, projectId, appId, filterTypes = [], filterNoEdit = false } = props;
  const [keyWord, setKeyWord] = useState('');
  const [currentTab, setCurrentTab] = useState(appId ? 'app' : 'project');
  const [loading, setLoading] = useState(false);
  const [varList, setVarList] = useState([]);
  const [selectedVar, setSelectedVar] = useState({});

  useEffect(() => {
    setLoading(true);
    variableApi
      .gets({
        sourceId: appId || projectId,
        sourceType: !appId ? 0 : currentTab === 'project' ? 11 : 1,
      })
      .then(res => {
        setLoading(false);
        if (res.resultCode === 1) {
          setVarList(res.variables);
        } else {
          setVarList([]);
        }
      });
  }, [currentTab]);

  return (
    <SelectVarModal
      open
      mask={{ closable: true }}
      keyboard
      type="fixed"
      width={800}
      title={_l('选择全局变量')}
      okDisabled={_.isEmpty(selectedVar)}
      onOk={() => {
        onOk(selectedVar);
        onClose();
      }}
      onCancel={() => {
        onClose();
      }}
    >
      <div className="selectVarWrapper">
        <SearchInput
          className="searchCon"
          placeholder={_l('搜索变量名称')}
          onChange={_.debounce(value => {
            setKeyWord(value);
          }, 500)}
        />
        <div className="tabWrap">
          {tabInfos
            .filter(o => appId || (!appId && o.value === 'project'))
            .map(item => (
              <div
                className={cx('tabItem Hand', { active: item.value === currentTab })}
                onClick={() => setCurrentTab(item.value)}
              >
                {item.label}
              </div>
            ))}
        </div>
        <div className="flex">
          <GlobalVarTable
            data={varList.filter(
              item =>
                item.name.toLocaleLowerCase().indexOf(keyWord.toLocaleLowerCase()) > -1 &&
                (!filterTypes.length || _.includes(filterTypes, item.controlType)) &&
                (item.allowEdit === 1 || !filterNoEdit),
            )}
            readOnly={true}
            allowSelected={true}
            onSelect={varObj => setSelectedVar(varObj)}
            loading={loading}
            emptyText={keyWord ? _l('暂无搜索结果') : _l('暂无全局变量')}
            emptyNoBorder={true}
          />
        </div>
      </div>
    </SelectVarModal>
  );
}

export function useSelectGlobalVar() {
  return useFunctionWrapComponent(SelectGlobalVar);
}
