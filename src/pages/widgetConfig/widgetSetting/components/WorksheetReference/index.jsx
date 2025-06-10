import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import emptyBg from 'staticfiles/images/unReferenced.png';
import { Button, Dialog, LoadDiv, ScrollView, Support } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import workflowAjax from 'src/pages/workflow/api/worksheetReference';
import { getTranslateInfo } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import { MODULE_TYPES, SIDEBAR_LIST, SIDEBAR_LIST_BY_WORKSHEET, SUB_MODULE_TYPES, SUBNAV_LIST } from './config';
import { WorksheetField, WorksheetRules, WorksheetView, WorksheetWorkflow } from './ReferenceModule';
import { ReferenceWrap } from './styled';
import '../../../styled/style.less';

const iteratee = item => {
  return item.parentId + '|' + item.id;
};

const filterByAppId = (list = [], appId, appType, subModule) => {
  const filterList = list.filter(r => {
    if (appType === 'sub') return r.appId === appId;
    if (appType === 'subList') return !r.appId;
    return r.appId && r.appId !== appId;
  });
  if (subModule === SUB_MODULE_TYPES.WORKFLOW) return filterList;
  return filterList.map(item => {
    return { ...item, references: _.uniqBy(item.references, iteratee) };
  });
};

const showNav = (subModule, list = [], appType) => {
  if (
    (subModule !== SUB_MODULE_TYPES.WIDGET && appType === 'subList') ||
    (subModule === SUB_MODULE_TYPES.WIDGET && appType === 'subList' && list.every(l => !!l.appId))
  )
    return false;
  return true;
};

const groupByDisabled = (list = []) => {
  let totalRe = _.reduce(
    list,
    (total, cur) => {
      return total.concat(cur.references || []);
    },
    [],
  );
  totalRe = _.map(_.groupBy(totalRe, 'disabled'), (list, key) => {
    return { disabled: key === 'false' ? false : true, references: list };
  });
  return _.sortBy(totalRe, 'disabled');
};

const getGroupCount = (list, subModule) => {
  const totalList = _.reduce(
    list,
    (total, cur) => {
      return total.concat(cur.references || []);
    },
    [],
  );
  return _.uniqBy(totalList, subModule === SUB_MODULE_TYPES.WORKFLOW ? 'parentId' : 'id').length;
};

function WorksheetReferenceDialog(props) {
  const { data = {}, globalSheetInfo = {}, type = 1 } = props;
  const { worksheetId, appId, name: worksheetName } = globalSheetInfo;
  const { controlId, controlName } = data;
  const [{ subModule, moduleType, references, loading, appType, workflowLoadings, visible, isInit }, setState] =
    useSetState({
      subModule: SUB_MODULE_TYPES.WIDGET,
      moduleType: MODULE_TYPES.WIDGET,
      references: [],
      loading: false,
      appType: 'sub', // 本应用
      workflowLoadings: {}, // 工作流单条刷新
      visible: true,
      isInit: true,
    });
  const list = filterByAppId(references, appId, appType, subModule);
  const count = getGroupCount(references, type === 2 ? SUB_MODULE_TYPES.WORKFLOW : subModule);
  const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

  const handleSideClick = key => {
    if (subModule === key) return;
    const isWorkflow = key === SUB_MODULE_TYPES.WORKFLOW;
    setState({
      subModule: key,
      appType: 'sub',
      isInit: true,
      references: [],
      loading: false,
      moduleType: isWorkflow ? MODULE_TYPES.WORKFLOW : MODULE_TYPES.WIDGET,
    });
  };

  useEffect(() => {
    //推送完刷新列表
    emitter.addListener('refreshReference', refreshReference);

    return () => {
      emitter.removeListener('refreshReference', refreshReference);
    };
  }, []);

  const refreshReference = () => {
    if (loading) return;
    setState({ loading: true });
    getWorkflowReferences({ appId: '' })
      .then(({ data, isRefresh = false, isInit = true }) => {
        setState({ references: data, loading: isRefresh, isInit });
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

  useEffect(() => {
    getReferenceList();
  }, [subModule, appType]);

  // 获取工作流
  const getWorkflowReferences = options => {
    return workflowAjax.getWorksheetReferences({
      worksheetId,
      worksheetName,
      controlId,
      controlName,
      isRefresh: false,
      appId: appType === 'sub' ? appId : '',
      ...options,
    });
  };

  // 获取字段、业务规则、视图
  const getWorksheetReferences = options => {
    return worksheetAjax.getWorksheetReferences({
      worksheetId,
      controlId,
      type,
      module: moduleType,
      subModule,
      isRefresh: false,
      appId: appType === 'sub' ? appId : '',
      ...options,
    });
  };

  const getReferenceList = options => {
    if (loading) return;

    setState({ loading: true });

    const isWorkflow = subModule === SUB_MODULE_TYPES.WORKFLOW;

    const referencePromise = isWorkflow ? getWorkflowReferences(options) : getWorksheetReferences(options);

    referencePromise
      .then(({ data, isRefresh = false, isInit = true }) => {
        setState({
          references: data.map(item => {
            item.appName = getTranslateInfo(item.appId, null, item.appId).name || item.appName;
            item.references = item.references.map(item => {
              item.name = getTranslateInfo(item.appId, null, item.id).name || item.name;
              item.parentName = getTranslateInfo(item.appId, null, item.parentId).name || item.parentName;
              return item;
            });
            return item;
          }),
          loading: isRefresh,
          isInit,
        });
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

  // 单条刷新
  const refreshItemWorkflowReference = ({ appId }) => {
    if (workflowLoadings[appId]) return;

    setState({ workflowLoadings: { ...workflowLoadings, [appId]: true } });

    const refreshPromise = getWorkflowReferences({ isRefresh: true, appId });

    refreshPromise
      .then(({ data }) => {
        const currentData = data.filter(i => i.appId === appId);
        const tempReferences = _.isEmpty(currentData)
          ? references.filter(i => i.appId !== appId)
          : references.map(i => (i.appId === appId ? _.get(currentData, '0') : i));
        setState({ references: tempReferences, workflowLoadings: { ...workflowLoadings, [appId]: false } });
      })
      .catch(() => {
        setState({ workflowLoadings: { ...workflowLoadings, [appId]: false } });
      });
  };

  // 二次确认
  const handleConfirm = () => {
    if (loading) return;
    Dialog.confirm({
      title: <span className="Bold Font17">{_l('重新扫描全组织引用关系？')}</span>,
      description: (
        <span className="mTop8 Gray_75">
          {_l('本次操作将全量扫描组织下所有工作流节点，并更新字段及工作表的引用记录，可能需要较长时间。')}
        </span>
      ),
      onOk: () => getReferenceList({ appId: '', isRefresh: true }),
    });
  };

  const renderEmptyReference = () => {
    return (
      <div className="emptyContent">
        <img width={160} height={160} src={emptyBg} />
        <div className="Gray_9e Font16">{_l('暂未被引用')}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="emptyContent">
          <LoadDiv size="big" />
          {_.includes([SUB_MODULE_TYPES.WORKFLOW], subModule) && (
            <Fragment>
              <span className="Gray_75 mTop20">
                {type === 1 ? _l('正在为您扫描字段引用关系，请稍后…') : _l('正在为您扫描表引用关系，请稍后…')}
              </span>
              {appType === 'total' && (
                <span className="Gray_75">{_l('查找需要较长时间，完成后可以发送系统通知提醒您')}</span>
              )}
            </Fragment>
          )}
        </div>
      );
    }

    if (!list.length) {
      return renderEmptyReference();
    }

    const moduleProps = {
      ...props,
      list,
      appType,
      loading,
    };

    let content = '';

    switch (subModule) {
      case SUB_MODULE_TYPES.WIDGET:
        content = <WorksheetField {...moduleProps} />;
        break;
      case SUB_MODULE_TYPES.WORKFLOW:
        content = (
          <WorksheetWorkflow
            {...moduleProps}
            workflowLoadings={workflowLoadings}
            refreshItemWorkflowReference={refreshItemWorkflowReference}
          />
        );
        break;
      case SUB_MODULE_TYPES.RULES:
        content = <WorksheetRules {...moduleProps} list={groupByDisabled(list)} />;
        break;
      case SUB_MODULE_TYPES.VIEW:
        content = <WorksheetView {...moduleProps} />;
        break;
    }

    const getDesc = () => {
      switch (subModule) {
        case SUB_MODULE_TYPES.WIDGET:
          if (appType === 'subList')
            return type === 2
              ? _l('空白子表指添加子表字段时选择了从空白添加的子表字段。当前工作表正被以下空白子表使用')
              : _l('空白子表指添加子表字段时选择了从空白添加的子表字段。当前字段正被以下空白子表中的字段使用');
          return type === 2
            ? _l('展示其他工作表通过关联记录、（实体）子表、级联字段对当前工作表的引用')
            : _l(
                '展示其他字段对当前字段的关键引用，主要包括数据生成、逻辑计算、数据联动、数据限制等可能影响数据完整性或正确性的引用',
              );
        case SUB_MODULE_TYPES.WORKFLOW:
          return type === 2
            ? _l('当前工作表正被以下工作流节点使用')
            : _l(
                '展示工作流对当前字段的关键引用，主要包括筛选条件、动态值设置、人员配置等可能影响流程执行或数据准确性的引用',
              );
        case SUB_MODULE_TYPES.RULES:
          return _l('当前字段正被以下业务规则的筛选条件使用');
        case SUB_MODULE_TYPES.VIEW:
          return _l('当前字段正被以下视图的筛选条件、专属配置使用');
      }
    };

    return (
      <Fragment>
        {list.length > 0 && <div className="navDesc Gray_75">{getDesc()}</div>}
        {content}
      </Fragment>
    );
  };

  const renderTopBar = () => {
    const getNavCount = value => {
      if (_.includes([SUB_MODULE_TYPES.WORKFLOW], subModule) && appType !== value) return null;

      const filterList = filterByAppId(references, appId, value, subModule);

      return getGroupCount(filterList, type === 2 ? SUB_MODULE_TYPES.WORKFLOW : subModule);
    };

    return (
      <Fragment>
        {_.includes([SUB_MODULE_TYPES.WORKFLOW], subModule) && !isInit && (
          <div className="infoContent">
            {_l(
              '未包含功能上线前配置的工作流中所产生的引用关系。首次使用时需要对全组织工作流进行初始化扫描，以获取历史引用关系。',
            )}
            <span className="pointer ThemeColor3 ThemeHoverColor3" onClick={() => handleConfirm()}>
              {_l('立即初始化')}
            </span>
          </div>
        )}
        {_.includes([SUB_MODULE_TYPES.WIDGET, SUB_MODULE_TYPES.WORKFLOW, SUB_MODULE_TYPES.VIEW], subModule) && (
          <div className="subnavContainer">
            {SUBNAV_LIST.map(item => {
              if (!showNav(subModule, references, item.value)) return null;
              const navCount = getNavCount(item.value);
              return (
                <div
                  className={cx('subnavItem', { active: appType === item.value })}
                  onClick={() => {
                    if (appType === item.value) return;
                    setState({ appType: item.value });
                  }}
                >
                  {item.text}
                  {!!navCount && <span className="Gray75 mLeft8">{navCount}</span>}
                </div>
              );
            })}
            {_.includes([SUB_MODULE_TYPES.WORKFLOW], subModule) && (
              <div className="flex TxtRight">
                <Tooltip title={_l('重新扫描')} placement="bottom">
                  <span
                    className="Gray_9e ThemeHoverColor2 pointer icon-workflow_cycle Font18"
                    onClick={() => {
                      if (loading) {
                        alert(_l('正在扫描，请勿重复操作'), 3);
                        return;
                      }
                      if (appType === 'sub') {
                        getReferenceList({ isRefresh: true });
                      } else {
                        handleConfirm();
                      }
                    }}
                  ></span>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Dialog
      width={960}
      visible={visible}
      footer={null}
      onCancel={() => setState({ visible: false })}
      title={
        <Fragment>
          {type === 2 ? _l('查看引用关系（工作表：%0）', worksheetName) : _l('查看引用关系（字段：%0）', controlName)}
          <Support
            type={2}
            href="https://help.mingdao.com/worksheet/reference-details"
            text={_l('帮助')}
            className="Normal"
          />
        </Fragment>
      }
      className="worksheetReferenceDialog"
    >
      <ReferenceWrap height={windowHeight - 72 - 50}>
        <div className="sidebarContainer">
          {(type === 2 ? SIDEBAR_LIST_BY_WORKSHEET : SIDEBAR_LIST).map(item => {
            const isActive = subModule === item.value;
            return (
              <div
                className={cx('sidebarItem overflow_ellipsis', { active: isActive })}
                onClick={() => handleSideClick(item.value)}
              >
                {item.text}
                {!_.includes([SUB_MODULE_TYPES.WORKFLOW], subModule) && isActive && !!count && (
                  <span className="Num">{count}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="referenceContainer">
          {renderTopBar()}
          <ScrollView className="referenceContent">{renderContent()}</ScrollView>
        </div>
      </ReferenceWrap>
    </Dialog>
  );
}

export function renderDialog(opts) {
  functionWrap(WorksheetReferenceDialog, opts);
}

export default function WorksheetReference(props) {
  return (
    <Fragment>
      <span
        className={cx('Font13 ThemeColor3 ThemeHoverColor2 pointer Normal', props.className)}
        onClick={e => {
          e.stopPropagation();
          renderDialog(props);
        }}
      >
        {_l('查看引用')}
      </span>
    </Fragment>
  );
}
