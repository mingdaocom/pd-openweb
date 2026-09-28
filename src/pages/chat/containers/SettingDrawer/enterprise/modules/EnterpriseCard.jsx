import React, { Fragment, useCallback, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import account from 'src/api/account';
import common from 'src/utils/domain/account/settings';
import EditCardInfo from './EditCardInfo';
import { formatProjectStatus, getAvailableOptions, getHasProjectAdminAuth, getItems } from './enterpriseCardUtils';
import useEnterpriseCardActions from './useEnterpriseCardActions';
import './index.less';

const noop = () => {};

const CardStatusAction = ({ type, card, actions }) => {
  switch (type) {
    case 'review':
      return (
        <span>
          <span className="colorPrimary hoverColorPrimaryLight Hand" onClick={() => actions.handleReview(card)}>
            {_l('待审核')}
          </span>
          <span
            className="cancelApplication hoverColorPrimaryLight Hand mLeft24"
            onClick={() => actions.cancelApplication(card)}
          >
            {_l('取消申请')}
          </span>
        </span>
      );
    case 'trial':
      return <span className="trialText">{_l('免费试用剩余%0天', _.get(card, 'currentLicense.expireDays'))}</span>;
    default:
      return null;
  }
};

export default function EnterpriseCard({
  card,
  DragHandle,
  isClose,
  isCurrentProject,
  getData = noop,
  onOpenReportRelation = noop,
}) {
  const [showItem, setShowItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [editingUserInfo, setEditingUserInfo] = useState(null);
  const actions = useEnterpriseCardActions({ card, getData, onEdit: setEditingUserInfo, onOpenReportRelation });
  const { currentLicense = {}, closedOperatorName, closedTime } = card;
  const { departmentInfos = [], jobInfos = [] } = userInfo;
  const projectStatus = formatProjectStatus(card);
  const hasProjectAdminAuth = getHasProjectAdminAuth(card);
  const canManageProject = projectStatus.manage && hasProjectAdminAuth;
  const isWaitOpen =
    card.projectStatus === common.PROJECT_STATUS_TYPES.FREE ||
    card.projectStatus === common.PROJECT_STATUS_TYPES.TOPAID;
  const availableOptions = getAvailableOptions({
    isClose,
    isPlatform: window.platformENV.isPlatform,
  });

  const getAuthInfo = useCallback(() => {
    setLoading(true);
    account.getUserCard({ projectId: card.projectId }).then(data => {
      if (data) {
        setUserInfo(data.user);
        setLoading(false);
      }
    });
  }, [card.projectId]);

  const handleChangeShow = useCallback(
    event => {
      if (event.target.className.includes('childTag')) return;

      const nextShowItem = !showItem;
      setShowItem(nextShowItem);
      if (nextShowItem) getAuthInfo();
    },
    [getAuthInfo, showItem],
  );

  return (
    <Fragment>
      <div
        className={cx('enterpriseCardItem', { active: showItem, currentProject: isCurrentProject })}
        onClick={handleChangeShow}
      >
        {isCurrentProject && <div className="currentProjectTag">{_l('当前组织')}</div>}
        {DragHandle && (
          <DragHandle>
            <Icon icon="drag" className="dragIcon" />
          </DragHandle>
        )}
        <div className="cardItemHeader Hand">
          <div className="cardItemLeft">
            <div className="Font17 Bold mBottom12 textPrimary">{card.companyName}</div>
            <div className="cardItemInfo">
              <div className={cx('itemTag', isClose ? 'closeActive' : isWaitOpen ? 'grayActive' : 'active')}>
                {isClose ? _l('已关闭') : currentLicense.version ? currentLicense.version.name : _l('免费版')}
              </div>
              <div className="mLeft24 mRight24 itemDivice"></div>
              <div className={cx('textSecondary', { hover_blue: !isClose })}>
                {isClose ? (
                  _l('%0 于%1关闭', closedOperatorName, closedTime ? createTimeSpan(closedTime) : '-')
                ) : (
                  <span
                    onClick={() => {
                      copy(card.projectCode);
                      alert(_l('复制成功'));
                    }}
                  >
                    <span className="childTag">{_l('组织门牌号：%0', card.projectCode)}</span>
                    <span className="icon-content-copy Font12 mLeft5 childTag"></span>
                  </span>
                )}
              </div>
              {(window.platformENV.isOverseas || window.platformENV.isLocal) && (
                <div className="textSecondary hover_blue mLeft16">
                  <span
                    onClick={() => {
                      copy(card.projectId);
                      alert(_l('复制成功'));
                    }}
                  >
                    <span className="childTag">{_l('组织 ID：%0', card.projectId)}</span>
                    <span className="icon-content-copy Font12 mLeft5 childTag"></span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="cardItemRight">
            {!isClose && canManageProject && (
              <Button
                shape="round"
                onClick={event => {
                  event.stopPropagation();
                  actions.handleGoAdmin(card);
                }}
              >
                {_l('组织管理')}
              </Button>
            )}
            <span className="cardHeaderActionGroup">
              {!isClose && <CardStatusAction type={projectStatus.buttonState} card={card} actions={actions} />}
            </span>
            <span
              className={cx('Font20 mLeft12 textSecondary', showItem ? 'icon-expand_more' : 'icon-navigate_next')}
            ></span>
          </div>
        </div>
        <div className={cx('infoContent', showItem ? 'extendInfo' : 'closeInfo')}>
          {loading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="extendItemBox">
                <div className="extendItemLabel textSecondary">{_l('组织名片')}</div>
                <div className="extendRight">
                  <div className="flexRow mBottom8">
                    <div className="extendRightLabel">{_l('姓名')}</div>
                    <div>{userInfo.fullname || _l('未填写')}</div>
                  </div>
                  <div className="flexRow mBottom8">
                    <div className="extendRightLabel">{_l('部门')}</div>
                    <div>{departmentInfos.length ? getItems(departmentInfos, 'departmentName') : _l('未填写')}</div>
                  </div>
                  <div className="flexRow">
                    <div className="extendRightLabel">{_l('职位')}</div>
                    <div>{jobInfos.length ? getItems(jobInfos, 'jobName') : _l('未填写')}</div>
                  </div>
                </div>
              </div>
              <div className="extendItemBox textSecondary">
                {availableOptions.map(item => (
                  <span
                    key={item.key}
                    className={cx(
                      'flexRow mRight40',
                      projectStatus[item.key] ? 'Hand textPrimary hover_blue' : 'textTertiary',
                    )}
                    onClick={() => (projectStatus[item.key] ? actions[item.click](userInfo, isClose) : null)}
                  >
                    <span className={cx('mRight12 LineHeight20 childTag', item.icon)}></span>
                    <span className="childTag">{item.label}</span>
                  </span>
                ))}
              </div>
            </Fragment>
          )}
        </div>
      </div>
      {editingUserInfo && (
        <EditCardInfo
          visible
          userInfo={editingUserInfo}
          updateData={setUserInfo}
          closeDialog={() => setEditingUserInfo(null)}
        />
      )}
    </Fragment>
  );
}
