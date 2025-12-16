import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import variableApi from 'src/api/variable';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { CONTROL_NAME, REFRESH_TYPE } from '../constant';
import { formatVarList } from '../utils';
import OptionColumn from './OptionColumn';
import VarLog from './VarLog';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .headTr {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 14px 10px;
    border-bottom: 1px solid #e0e0e0;
    color: #757575;
    &.emptyNoBorder {
      border-bottom: none;
    }
  }
  .name {
    flex: 6;
    min-width: 40%;
    flex-grow: initial;
    padding-right: 8px;
  }
  .value {
    flex: 6;
    min-width: 0;
  }
  .description {
    flex: 4;
    min-width: 0;
  }
  .option {
    flex: 1;
  }

  .dataItem {
    display: flex;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 14px;
    .doneIcon {
      display: none;
      position: absolute;
      top: 12px;
      right: 20px;
      color: #1677ff;
    }

    &:hover {
      background: #f5f5f5;
      .optionIcon {
        display: block;
      }
    }
    &.allowSelect {
      cursor: pointer;
      position: relative;
      &.isActive {
        background: #dbeefd;
        .doneIcon {
          display: block;
        }
      }
    }
    &.isEditing {
      background: #ecf7fe;
    }

    .name {
      .foldIcon {
        cursor: pointer;
        &:hover {
          .icon-arrow-right-tip,
          .icon-arrow-down {
            color: #1677ff;
          }
        }
      }
      i {
        font-size: 16px;
        color: #bdbdbd;
        cursor: pointer;
      }
    }
    .value {
      .emptyValue {
        width: fit-content;
        height: 16px;
        line-height: 16px;
        padding: 0 8px;
        border-radius: 27px;
        color: #f51744;
        background: rgba(245, 23, 68, 0.08);
        font-size: 11px;
      }
      .maskIcon {
        color: #bdbdbd;
        margin-left: 8px;
        cursor: pointer;
        &:hover {
          color: #1677ff;
        }
      }
    }
  }
`;

const NoDataWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .iconCon {
    width: 130px;
    height: 130px;
    text-align: center;
    background: #f5f5f5;
    border-radius: 50%;
    color: #c2c3c3;
    i {
      line-height: 130px;
    }
  }
`;

export default function GlobalVarTable(props) {
  const {
    data,
    loading,
    onRefreshVarList = () => {},
    emptyText,
    onAdd = () => {},
    onEdit = () => {},
    readOnly,
    allowSelected,
    onSelect = () => {},
    activeId,
    setActiveId,
    projectId,
    emptyNoBorder,
  } = props;
  const [varTreeList, setVarTreeList] = useState([]);
  const [dirFolded, setDirFolded] = useState([]);
  const [showMaskValueArr, setShowMaskValueArr] = useState([]);
  const [selectedVar, setSelectedVar] = useState({});
  const [varLog, setVarLog] = useState({ visible: false, id: '', projectId: '' });
  const featureType = getFeatureStatus(projectId, VersionProductType.globalVariable);

  useEffect(() => {
    setVarTreeList(formatVarList(data));
  }, [data]);

  const onEditVar = id => {
    variableApi.get({ id }).then(res => {
      onEdit(res.resultCode === 1 ? res.variable : {});
    });
  };

  const columns = [
    {
      dataIndex: 'name',
      title: _l('名称'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter">
            {item.hasChild ? (
              <div
                className="foldIcon"
                onClick={() => {
                  const isShow = !_.includes(dirFolded, item.key);
                  setDirFolded(isShow ? dirFolded.concat([item.key]) : dirFolded.filter(dir => dir !== item.key));
                }}
              >
                <Icon
                  className="Font13 mRight8"
                  icon={_.includes(dirFolded, item.key) ? 'arrow-right-tip' : 'arrow-down'}
                />
                <Icon icon="custom_folder_2" />
                <span className="mLeft6 Gray overflow_ellipsis">{item.name}</span>
              </div>
            ) : (
              <div className="Hand overflow_ellipsis" onClick={!readOnly ? () => onEditVar(item.id) : () => {}}>
                <Tooltip title={CONTROL_NAME[item.controlType]} placement="top">
                  <Icon icon={getIconByType(item.controlType)} />
                </Tooltip>
                {item.name.indexOf('.') > -1 ? (
                  <React.Fragment>
                    <span className="mLeft6 Gray_9e">{item.name.slice(0, item.name.lastIndexOf('.'))}</span>
                    <span className="Gray">{item.name.slice(item.name.lastIndexOf('.'), item.name.length)}</span>
                  </React.Fragment>
                ) : (
                  <span className="mLeft6 Gray">{item.name}</span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'value',
      title: _l('值'),
      render: item => {
        return !item.value && item.value !== 0 && !item.hasChild ? (
          <div className="flexRow alignItemsCenter h100">
            <div className="emptyValue">{_l('值为空')}</div>
          </div>
        ) : (
          <div className="flexRow alignItemsCenter">
            <span className="Gray_9e overflow_ellipsis">
              {!item.hasChild
                ? item.maskType === 0 || _.includes(showMaskValueArr, item.id)
                  ? item.value
                  : '*'.repeat(item.value.length)
                : ''}
            </span>
            {item.maskType === 1 && !readOnly && (
              <Tooltip placement="top" title={_.includes(showMaskValueArr, item.id) ? _l('隐藏') : _l('显示')}>
                <Icon
                  icon={_.includes(showMaskValueArr, item.id) ? 'workflow_hide' : 'eye_off'}
                  className="maskIcon"
                  onClick={() => {
                    const isShow = _.includes(showMaskValueArr, item.id);
                    setShowMaskValueArr(
                      isShow ? showMaskValueArr.filter(i => i !== item.id) : showMaskValueArr.concat(item.id),
                    );
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'description',
      title: _l('描述'),
      render: item => {
        return <div className="Gray_9e overflow_ellipsis">{item.description}</div>;
      },
    },
    {
      dataIndex: 'option',
      title: '',
      render: item => {
        return !readOnly ? (
          <OptionColumn
            isDirOption={item.hasChild}
            onAdd={() => {
              featureType === '2'
                ? buriedUpgradeVersionDialog(projectId, VersionProductType.globalVariable)
                : onAdd(`${item.key}.`);
            }}
            onEdit={() => onEditVar(item.id)}
            onDelete={() => {
              featureType === '2'
                ? buriedUpgradeVersionDialog(projectId, VersionProductType.globalVariable)
                : variableApi.remove({ id: item.id }).then(res => {
                    if (res) {
                      onRefreshVarList(REFRESH_TYPE.DELETE, item);
                      alert(_l('删除成功'));
                    }
                  });
            }}
            onLog={() => {
              setVarLog({ visible: true, id: item.id, projectId: item.projectId });
              setActiveId(item.id);
            }}
          />
        ) : (
          ''
        );
      },
    },
  ];

  const renderVarTable = list => {
    return list.map(varItem => {
      const allowSelect = !varItem.hasChild && allowSelected;
      const children = varTreeList.filter(item => item.pid === varItem.key) || [];

      return (
        <React.Fragment>
          <div
            key={varItem.hasChild ? varItem.key : varItem.id}
            className={cx('dataItem', {
              allowSelect,
              isActive: selectedVar.id === varItem.id,
              isEditing: activeId === varItem.id && !varItem.hasChild,
            })}
            onClick={
              allowSelect
                ? () => {
                    setSelectedVar(varItem);
                    onSelect(varItem);
                  }
                : () => {}
            }
          >
            {columns.map((item, i) => {
              return (
                <div
                  key={`${varItem.hasChild ? varItem.key : varItem.id}-${i}`}
                  className={`${item.dataIndex}`}
                  style={{
                    paddingLeft: item.dataIndex === 'name' ? `${(varItem.key.split('.').length - 1) * 30}px` : 0,
                  }}
                >
                  {item.render ? item.render(varItem) : varItem[item.dataIndex]}
                </div>
              );
            })}
            <Icon icon="done" className="doneIcon" />
          </div>
          {!!children.length && !_.includes(dirFolded, varItem.key) && renderVarTable(children)}
        </React.Fragment>
      );
    });
  };

  return (
    <Wrapper>
      <div className={cx('headTr', { emptyNoBorder: emptyNoBorder && !varTreeList.length })}>
        {columns.map((item, index) => {
          return (
            <div key={index} className={`${item.dataIndex}`}>
              {item.title}
            </div>
          );
        })}
      </div>
      {loading ? (
        <LoadDiv className="mTop10" />
      ) : !varTreeList.length ? (
        <NoDataWrapper>
          <div className="iconCon">
            <Icon icon="global_variable" className="Font64" />
          </div>
          <div className="mTop24 Font16 Gray_9e">{emptyText}</div>
        </NoDataWrapper>
      ) : (
        <ScrollView>
          {renderVarTable(varTreeList.filter(item => !item.pid))}
          {varLog.visible && (
            <VarLog
              variableId={varLog.id}
              projectId={varLog.projectId}
              onClose={() => {
                setVarLog({ visible: false, id: '', projectId: '' });
                setActiveId('');
              }}
            />
          )}
        </ScrollView>
      )}
    </Wrapper>
  );
}
