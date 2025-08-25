import React, { Fragment, useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SvgIcon } from 'ming-ui';
import { SettingCollapseWrap } from 'src/pages/widgetConfig/widgetSetting/content/styled.js';
import { getIcons } from 'src/pages/workflow/WorkflowSettings/utils.js';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';
import { getWidgetInfo, toEditWidgetPage } from '../../../util';
import { REFERENCE_TYPE } from './config';
import { ExtraTime } from './styled';

const { Panel } = Collapse;

const renderHeader = l => {
  return (
    <div className="flexCenter">
      <div className="itemAppIcon" style={{ background: l.iconColor }}>
        <SvgIcon url={l.appIcon} fill="#fff" size={13} />
      </div>
      {l.appName}
    </div>
  );
};

export const WorksheetField = props => {
  const { appType, list = [], loading, type, globalSheetInfo = {} } = props;
  const isWorksheet = type === 2;
  const [expandKeys, setExpandKeys] = useState([]);
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    handleGroup();
  }, [loading]);

  const isPassive = item => {
    const { worksheetList, controls } = globalSheetInfo;

    if ((!worksheetList && !controls) || item.type !== 29 || type !== 2) return false;

    if (controls) {
      const control = controls.find(l => l.sourceControlId === item.id);

      return (
        control &&
        _.get(
          _.find(control.relationControls, l => l.controlId === item.id),
          'row',
        ) > 9999
      );
    }

    const parentWorksheet = _.find(worksheetList, l => l.worksheetId === item.parentId);

    return !parentWorksheet ? false : !_.find(parentWorksheet.controls, l => l.controlId === item.id);
  };

  const handleGroup = () => {
    const groups = list.map(item => {
      return {
        ...item,
        references: _.map(_.groupBy(item.references, 'parentId'), (list, key) => {
          return { parentId: key, parentName: _.get(list, '0.parentName'), referenceItems: list || [] };
        }),
      };
    });
    setGroupList(groups);

    if (appType === 'total') {
      setExpandKeys(groups.map(i => i.appId));
    }
  };

  const renderChildItem = item => {
    const isPassiveItem = isPassive(item);
    return (
      <Fragment>
        <div
          className={cx('overflow_ellipsis mTop8 mBottom8 controlName pLeft22', {
            isPassive: isPassiveItem || !item.appId,
          })}
          onClick={() => {
            !isPassiveItem &&
              item.appId &&
              toEditWidgetPage({
                sourceId: item.parentId,
                targetControl: item.id,
                fromURL: 'newPage',
              });
          }}
        >
          <Icon icon={_.get(getWidgetInfo(item.type), 'icon')} className="Font16" />
          <span className="overflow_ellipsis Bold mLeft6">
            {item.name}
            {isPassiveItem ? _l('（被动关联）') : null}
          </span>
        </div>
        {!isWorksheet && <div className="pLeft44">{REFERENCE_TYPE[item.referenceType]}</div>}
      </Fragment>
    );
  };

  const renderItem = i => {
    return (
      <Fragment>
        {(i.references || []).map(item => {
          return (
            <div className="referenceItem">
              <div className="Gray_75 overflow_ellipsis flexCenter">
                <Icon icon="worksheet" className="Font16 mRight8" />
                {_.get(item, 'parentName')}
                {!isWorksheet && item.parentId === globalSheetInfo.worksheetId && `（${_l('本表')}）`}
              </div>
              {item.referenceItems.map(l => renderChildItem(l))}
            </div>
          );
        })}
      </Fragment>
    );
  };

  if (appType === 'total') {
    return (
      <SettingCollapseWrap
        contentBg="#fafafa"
        headerPadding={12}
        bordered={false}
        activeKey={expandKeys}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        onChange={value => {
          setExpandKeys(value);
        }}
      >
        {groupList.map(l => {
          return (
            <Panel header={renderHeader(l)} key={l.appId}>
              {renderItem(l)}
            </Panel>
          );
        })}
      </SettingCollapseWrap>
    );
  }

  return <Fragment>{groupList.map(l => renderItem(l))}</Fragment>;
};

export const WorksheetWorkflow = props => {
  const { appType, list = [], loading, workflowLoadings, refreshItemWorkflowReference } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  useEffect(() => {
    if (appType === 'total') {
      setExpandKeys(list.map(i => i.appId));
    }
  }, [loading]);

  const renderItem = item => {
    return (
      <Fragment>
        {(item.references || []).map(i => {
          return (
            <div className="referenceItem">
              <div className="ruleContent">
                <div className="flex overflow_ellipsis Gray Bold">{i.parentName}</div>
                <div className="ruleStatus flexCenter justifyContentRight">
                  <div className="point" style={{ background: i.enabled ? '#00CA83' : '#cccccc' }}></div>
                  <div className="mLeft6">{i.enabled ? _l('开启') : _l('关闭')}</div>
                </div>
              </div>
              {(i.referenceItems || []).map(r => {
                return (
                  <div
                    className="flexCenter overflow_ellipsis mTop8 pointer controlName"
                    onClick={() => window.open(`${location.origin}/workflowedit/${i.parentId}/1/${r.type}/${r.id}`)}
                  >
                    <i className={`${getIcons(r.type, r.appType, r.actionId)}`} />
                    <span className="flex overflow_ellipsis mLeft6">{r.name || _l('分支')}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Fragment>
    );
  };

  const renderExtra = item => {
    return (
      <ExtraTime
        className="pointer"
        isLoading={workflowLoadings[item.appId]}
        onClick={e => {
          e.stopPropagation();
          refreshItemWorkflowReference(item);
        }}
      >
        <span className="time">{item.ctime}</span>
        <i className="getBtn icon-workflow_cycle" />
      </ExtraTime>
    );
  };

  if (appType === 'total') {
    return (
      <SettingCollapseWrap
        bordered={false}
        headerPadding={12}
        contentBg="#fafafa"
        activeKey={expandKeys}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        onChange={value => {
          setExpandKeys(value);
        }}
      >
        {list.map(l => {
          return (
            <Panel header={renderHeader(l)} key={l.appId} extra={renderExtra(l)}>
              {renderItem(l)}
            </Panel>
          );
        })}
      </SettingCollapseWrap>
    );
  }

  return <Fragment>{list.map(l => renderItem(l))}</Fragment>;
};

export const WorksheetRules = props => {
  const { list = [], loading } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  useEffect(() => {
    setExpandKeys(list.map(i => i.disabled));
  }, [loading]);

  const renderItem = i => {
    return (
      <Fragment>
        {(i.references || []).map(item => {
          return (
            <div className="referenceItem">
              <div
                className="flex overflow_ellipsis Bold pointer ThemeHoverColor3"
                onClick={() => window.open(`${location.origin}/worksheet/formSet/edit/${item.parentId}/display`)}
              >
                {item.name}
              </div>
              <div className="mTop6">{item.type === 0 ? _l('交互规则') : _l('验证规则')}</div>
            </div>
          );
        })}
      </Fragment>
    );
  };

  return (
    <SettingCollapseWrap
      bordered={false}
      headerPadding={12}
      contentBg="#fafafa"
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      onChange={value => {
        setExpandKeys(value);
      }}
    >
      {list.map(l => {
        return (
          <Panel header={l.disabled ? _l('关闭') : _l('开启')} key={l.disabled}>
            {renderItem(l)}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
};
export const WorksheetView = props => {
  const { list = [], appType, loading, globalSheetInfo = {} } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  useEffect(() => {
    if (appType === 'total') {
      setExpandKeys(list.map(i => i.appId));
    }
  }, [loading]);

  const renderItem = i => {
    return (
      <Fragment>
        {(i.references || []).map(item => {
          const viewType = VIEW_DISPLAY_TYPE[item.type];
          const { color, icon } = _.find(VIEW_TYPE_ICON, v => v.id === viewType) || {};
          return (
            <div className="referenceItem">
              <div className="Gray_75 overflow_ellipsis flexCenter">
                <Icon icon="worksheet" className="Font16 mRight8" />
                {item.parentName}
                {item.parentId === globalSheetInfo.worksheetId && `（${_l('本表')}）`}
              </div>
              <div
                className="flexRow pLeft22 mTop8 ThemeHoverColor3 pointer flexCenter"
                onClick={() => window.open(`${location.origin}/worksheet/${item.parentId}/view/${item.id}`)}
              >
                <Icon style={{ color, fontSize: '16px', marginRight: '6px' }} icon={icon} />
                <div className="flex overflow_ellipsis Bold">{item.name}</div>
              </div>
              <div className="mTop8 Gray pLeft44">{REFERENCE_TYPE[item.referenceType]}</div>
            </div>
          );
        })}
      </Fragment>
    );
  };

  if (appType === 'total') {
    return (
      <SettingCollapseWrap
        bordered={false}
        headerPadding={12}
        contentBg="#fafafa"
        activeKey={expandKeys}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        onChange={value => {
          setExpandKeys(value);
        }}
      >
        {list.map(l => {
          return (
            <Panel header={renderHeader(l)} key={l.appId}>
              {renderItem(l)}
            </Panel>
          );
        })}
      </SettingCollapseWrap>
    );
  }

  return <Fragment>{list.map(l => renderItem(l))}</Fragment>;
};
