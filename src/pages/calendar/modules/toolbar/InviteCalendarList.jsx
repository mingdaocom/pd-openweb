import React, { useState } from 'react';
import moment from 'moment';
import { Icon, UserCard } from 'ming-ui';
import { Avatar, Button, Checkbox, Dropdown, Empty } from 'ming-ui/antd-components';
import repeatIcon from '../images/repeat_ico.png';

const INVITE_EMPTY_AVATAR_STYLE = {
  color: 'var(--color-text-disabled)',
  fontSize: 48,
  backgroundColor: 'var(--color-background-secondary)',
};
const INVITE_EMPTY_ICON = <Avatar size={120} icon={<Icon icon="bellSchedule" />} style={INVITE_EMPTY_AVATAR_STYLE} />;
const INVITE_CATEGORY_BUTTON_STYLE = {
  width: 18,
  height: 18,
  padding: 0,
  flexShrink: 0,
  fontSize: 12,
};
const INVITE_EMPTY_STYLES = {
  image: {
    margin: '0 auto 20px',
  },
  description: {
    color: 'var(--color-text-tertiary)',
    fontSize: 18,
  },
};

const getStatusClassName = status => {
  if (String(status) === '0') return 'calendarCenterLabelNosubmit';
  if (String(status) === '1') return 'calendarCenterLabelSubmit';
  if (String(status) === '2') return 'calendarCenterLabelRefuse';
  return '';
};

const resizeAvatar = avatar =>
  avatar ? avatar.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/48/h/48') : '';

function InviteCategoryPicker({ categories, getColor, value, onChange }) {
  const items = [
    { catID: '1', catName: _l('工作日程'), color: 4 },
    ...categories.map(category => ({ ...category, catID: String(category.catID) })),
  ].map(category => ({
    key: category.catID,
    label: (
      <span className="inviteCategoryOption" title={category.catName}>
        <i className="inviteCategoryColor" style={{ backgroundColor: getColor(category.color) }} />
        <span>{category.catName}</span>
        {String(value) === category.catID && <Icon icon="ok" className="selectIcon" />}
      </span>
    ),
  }));
  const selectedCategory = [
    { catID: '1', color: 4 },
    ...categories.map(category => ({ ...category, catID: String(category.catID) })),
  ].find(category => category.catID === String(value));

  return (
    <Dropdown trigger={['click']} menu={{ items, onClick: ({ key }) => onChange(key) }}>
      <Button
        color={getColor(selectedCategory?.color ?? 4)}
        variant="solid"
        size="small"
        icon={<Icon icon="arrow-down-border" />}
        style={INVITE_CATEGORY_BUTTON_STYLE}
        aria-label={_l('选择日程分类')}
      />
    </Dropdown>
  );
}

function CalendarUser({ accountId, avatar, isCreator, name, remark, status }) {
  const content = (
    <span className="calendarUser pointer mRight15 InlineBlock mBottom5 Relative" title={remark || undefined}>
      <Avatar className="userHead" size={24} src={resizeAvatar(avatar)} />
      {getStatusClassName(status) && <span className={`userStatus ${getStatusClassName(status)}`} />}
      <span className="TxtTop calendarName">{name}</span>
      {isCreator && <span className="textSecondary TxtTop calendarName"> {_l('(发起人)')}</span>}
    </span>
  );

  return accountId ? <UserCard sourceId={accountId}>{content}</UserCard> : content;
}

function InviteCalendarItem({ calendar, categories, getColor, formatInviteData, onConfirm, onRefuse }) {
  const [categoryId, setCategoryId] = useState('1');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRefuseDialogOpen, setIsRefuseDialogOpen] = useState(false);
  const recurTime = calendar.recurTime ? moment(calendar.recurTime).toISOString() : '';

  const handleConfirm = () => {
    if (isConfirming) return;

    setIsConfirming(true);
    Promise.resolve(onConfirm(calendar.id, recurTime, categoryId))
      .catch(error => console.error(error))
      .finally(() => setIsConfirming(false));
  };

  const handleRefuse = () => {
    if (isRefuseDialogOpen) return;

    setIsRefuseDialogOpen(true);
    try {
      onRefuse(calendar.id, recurTime, () => setIsRefuseDialogOpen(false));
    } catch (error) {
      console.error(error);
      setIsRefuseDialogOpen(false);
    }
  };

  return (
    <li id={`inviteSinlge_${calendar.id}`}>
      <div className="inviteSinlge">
        <div className="inviteCalName alignItemsCenter">
          <InviteCategoryPicker
            categories={categories}
            getColor={getColor}
            value={categoryId}
            onChange={setCategoryId}
          />
          <span className="mLeft10 Bold WordBreak">{calendar.title}</span>
        </div>
        <div className="inviteContent">
          <div className="calTime">
            <span className="icon-access_time inviteIcon" />
            <span className="textTertiary">{_l('时间')}:</span>
            <span className="rightLabel">
              {formatInviteData(calendar.startTime, calendar.endTime, calendar.isAllDay, 0)}
            </span>
          </div>
          <div className="calAddress mTop15 clearfix">
            <div className="Left">
              <span className="icon-location inviteIcon" />
              <span className="textTertiary">{_l('地点')}:</span>
            </div>
            <span className={`${calendar.address ? '' : 'textPlaceholder '}rightLabel`}>
              {calendar.address || _l('未填写地址')}
            </span>
          </div>
          <div className="calMembers mTop15">
            <div className="participants">
              <span className="icon-charger inviteIcon" />
              <span className="textTertiary">{_l('成员:')}</span>
            </div>
            <div className="Left memberBox">
              <div className="createUser">
                <CalendarUser
                  accountId={calendar.createUser}
                  avatar={calendar.head}
                  isCreator
                  name={calendar.createUserName}
                  status={calendar.status}
                />
              </div>
              <div className="members">
                {calendar.members.map(member => (
                  <CalendarUser
                    key={member.accountID}
                    accountId={member.accountID}
                    avatar={member.head}
                    name={member.memberName}
                    remark={member.remark}
                    status={member.status}
                  />
                ))}
              </div>
              {!!calendar.thirdUserList?.length && (
                <>
                  <div className="wechatMemberTitle">{_l('通过日程分享加入的用户')}</div>
                  <div className="wechatMemberList">
                    <div className="wechatMembers">
                      {calendar.thirdUserList.map(thirdUser => (
                        <span key={thirdUser.thirdID} className="pointer mRight15 InlineBlock mBottom5 Relative">
                          <Avatar className="userHead" size={24} src={resizeAvatar(thirdUser.face)} />
                          <span className="userStatus calendarCenterLabelSubmit" />
                          <span className="TxtTop calendarName overflow_ellipsis">{thirdUser.nickName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="Clear" />
          </div>
          <div className="calDesc mTop15 textTertiary clearfix">
            <div className="Left">
              <span className="icon-calendar-abstract inviteIcon" />
              <span className="textTertiary">{_l('摘要')}:</span>
            </div>
            <span className={`${calendar.description ? '' : 'textPlaceholder '}rightLabel inviteDescription`}>
              {calendar.description || _l('未填写摘要')}
            </span>
          </div>
          {calendar.isRecur && !calendar.isChildCalendar && (
            <div className="repeatDesc mTop15">
              <div id="calendarInviteRepeat">
                <img src={repeatIcon} alt="" />
                <label className="textTertiary">{_l('重复')}:</label>
                <span className="repeatDetialDes mLeft10 rightLabel">{calendar.repeat}</span>
                <div className="Clear" />
              </div>
            </div>
          )}
          {calendar.isPrivate && (
            <div className="isPrivate mTop15 textTertiary">
              <Checkbox checked disabled>
                {_l('私密日程')}
              </Checkbox>
            </div>
          )}
          <div className="operator">
            <Button color="var(--color-success)" loading={isConfirming} onClick={handleConfirm}>
              {_l('确认')}
            </Button>
            <Button color="#607d8b" className="mLeft10" disabled={isRefuseDialogOpen} onClick={handleRefuse}>
              {_l('不能参加')}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function InviteCalendarList({ calendars, categories, getColor, formatInviteData, onConfirm, onRefuse }) {
  if (!calendars.length) {
    return (
      <li className="noData">
        <Empty image={INVITE_EMPTY_ICON} description={_l('暂无待确认日程')} styles={INVITE_EMPTY_STYLES} />
      </li>
    );
  }

  return calendars.map(calendar => (
    <InviteCalendarItem
      key={calendar.id}
      calendar={calendar}
      categories={categories}
      getColor={getColor}
      formatInviteData={formatInviteData}
      onConfirm={onConfirm}
      onRefuse={onRefuse}
    />
  ));
}
