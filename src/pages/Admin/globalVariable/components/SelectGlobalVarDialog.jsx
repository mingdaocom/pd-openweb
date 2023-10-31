import React, { useState, useEffect } from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import cx from 'classnames';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import GlobalVarTable from './GlobalVarTable';
import variableApi from 'src/api/variable';
import FunctionWrap from 'ming-ui/components/FunctionWrap';

const SelectVarDialog = styled(Dialog)`
  position: relative;
  .mui-dialog-body {
    padding: 0 !important;
  }
  .selectVarWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px;
    .searchCon {
      width: 100%;
      height: 36px;
    }
    .tabWrap {
      display: flex;
      border-bottom: 1px solid #eaeaea;
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
          border-bottom: 3px solid #2196f3;
          color: #2196f3;
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
    <SelectVarDialog
      visible
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
    </SelectVarDialog>
  );
}

export default props => FunctionWrap(SelectGlobalVar, { ...props });
