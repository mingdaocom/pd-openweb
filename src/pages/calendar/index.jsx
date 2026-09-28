import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from 'ming-ui';
import { Badge, Button, Menu, Modal } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { dialogSelectUser } from 'ming-ui/functions';
import calendarAjax from 'src/api/calendar';
import TaskDetail from 'src/pages/task/containers/taskDetail/taskDetail';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { formatInviteData, getCategoryColorClass, getInviteColor } from './calendarFormatters';
import CalendarView from './modules/calendar';
import { CalendarDetailContainer } from './modules/calendarDetail';
import { formatRecur } from './modules/calendarDetail/common';
import Comm from './modules/comm/comm';
import {
  CalendarTypeList,
  CategoryEditor,
  InviteCalendarList,
  OtherUserList,
  SynchronousContent,
} from './modules/toolbar';
import { getInitialSettings } from './pageConfig';
import './modules/css/share.less';
import './modules/toolbar/toolbar.less';

const CALENDAR_MENU_STYLES = {
  root: { border: 0, borderBottom: '1px solid var(--color-border-secondary)', padding: '10px 0' },
  item: {
    '--hap-menu-item-height': '40px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0 18px',
  },
  itemContent: { flex: 1, minWidth: 0, marginLeft: 15 },
};

const getCategoriesForUpdate = categories =>
  categories
    .map(({ catID, catName, color }) => ({ catID, catName: catName.trim(), color }))
    .filter(category => category.catName);

const getValidCategoryIds = (categoryIds, categories) => {
  if (categoryIds === null) return null;

  const validCategoryIds = new Set(categories.map(category => String(category.catID)));
  return categoryIds.filter(categoryId => validCategoryIds.has(String(categoryId)));
};

export default function CalendarEntrypoint() {
  const [initialSettings] = useState(() => getInitialSettings());
  const accountId = md.global.Account.accountId;
  const loadingCountRef = useRef(0);
  const otherUsersRequestRef = useRef(0);
  const inviteRequestPendingRef = useRef(false);
  const [filters, setFilters] = useState(initialSettings.filters);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [otherUsers, setOtherUsers] = useState([]);
  const [inviteCount, setInviteCount] = useState(0);
  const [invitedCalendars, setInvitedCalendars] = useState([]);
  const [activeContent, setActiveContent] = useState('calendar');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [calendarPosition, setCalendarPosition] = useState({
    date: initialSettings.initialDate,
    view: initialSettings.initialView,
  });
  const [taskDetail, setTaskDetail] = useState({ visible: false, taskId: '' });
  const [calendarDetail, setCalendarDetail] = useState(null);

  const handleLoadingChange = useCallback(loading => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current + (loading ? 1 : -1));
    setIsLoading(loadingCountRef.current > 0);
  }, []);

  const refreshCalendar = useCallback(() => {
    setRefreshToken(current => current + 1);
    setActiveContent('calendar');
  }, []);

  const saveMemberIds = useCallback(
    memberIds => {
      setFilters(current => ({ ...current, memberIds }));
      safeLocalStorageSetItem(`otherUsers${accountId}`, memberIds.join(','));
    },
    [accountId],
  );

  useEffect(() => {
    document.documentElement.classList.add('AppCalendar');
    document.title = _l('日程');

    if (window.location.search) {
      window.history.replaceState('', '', `${window.location.pathname}${window.location.hash}`);
    }

    return () => document.documentElement.classList.remove('AppCalendar');
  }, []);

  useEffect(() => {
    let isActive = true;

    calendarAjax
      .getUserAllCalCategories()
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        if (isActive) {
          const nextCategories = Array.isArray(source.data) ? source.data : [];
          setCategories(nextCategories);
          setFilters(current => {
            const nextCategoryIds = getValidCategoryIds(current.categoryIds, nextCategories);

            if (
              nextCategoryIds === null ||
              (nextCategoryIds.length === current.categoryIds.length &&
                nextCategoryIds.every((categoryId, index) => categoryId === current.categoryIds[index]))
            ) {
              return current;
            }

            safeLocalStorageSetItem('categorys', nextCategoryIds.join(','));
            return { ...current, categoryIds: nextCategoryIds };
          });
        }
      })
      .catch(error => console.error(error))
      .finally(() => {
        if (isActive) setCategoriesLoading(false);
      });

    calendarAjax
      .getUserInvitedCalendarsCount()
      .then(source => {
        if (isActive && source.code === 1) setInviteCount(Number(source.data) || 0);
      })
      .catch(error => console.error(error));

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const requestId = otherUsersRequestRef.current + 1;
    otherUsersRequestRef.current = requestId;
    const coworkerIds = filters.memberIds.filter(memberId => memberId !== accountId);
    if (!coworkerIds.length) return;

    calendarAjax
      .getUserInfo({ accountIDs: coworkerIds.join(',') })
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        if (otherUsersRequestRef.current === requestId) setOtherUsers(source.data || []);
      })
      .catch(error => console.error(error));

    return () => {
      if (otherUsersRequestRef.current === requestId) otherUsersRequestRef.current += 1;
    };
  }, [accountId, filters.memberIds]);

  const updateFilter = (changes, storageKey, storageValue) => {
    setFilters(current => ({ ...current, ...changes }));
    if (storageKey) safeLocalStorageSetItem(storageKey, storageValue);
  };

  const selectedCategoryIds =
    filters.categoryIds === null ? categories.map(category => String(category.catID)) : filters.categoryIds;

  const handleCategoryChange = (categoryId, checked) => {
    const nextCategoryIds = checked
      ? Array.from(new Set([...selectedCategoryIds, categoryId]))
      : selectedCategoryIds.filter(id => id !== categoryId);
    updateFilter({ categoryIds: nextCategoryIds }, 'categorys', nextCategoryIds.join(','));
  };

  const deleteCategory = catId =>
    new Promise(resolve => {
      Modal.confirm({
        wrapClassName: 'DeleteUserCalCategory',
        width: 408,
        content: <span className="textError Font18 bold">{_l('删除之后该分类下的全部日程归类到工作日程？')}</span>,
        onCancel: () => resolve(false),
        onOk: () =>
          calendarAjax
            .deleteUserCalCategory({ catID: catId })
            .then(source => {
              if (source.code !== 1) throw new Error(source.msg);
              setCategories(current => current.filter(category => String(category.catID) !== String(catId)));
              if (filters.categoryIds !== null) {
                const nextCategoryIds = filters.categoryIds.filter(id => id !== String(catId));
                updateFilter({ categoryIds: nextCategoryIds }, 'categorys', nextCategoryIds.join(','));
              }

              refreshCalendar();
              resolve(true);
              return true;
            })
            .catch(error => {
              console.error(error);
              alertIfNotUnauthorized(error, _l('删除失败'), 3);
              resolve(false);
              return false;
            }),
      });
    });

  const updateCategories = draftCategories => {
    const oldCategoryIds = new Set(categories.map(category => String(category.catID)));
    return calendarAjax
      .updateUserCalCategoryInfo({ newCalCategory: JSON.stringify(draftCategories) })
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        const nextCategories = Array.isArray(source.data) && source.data.length ? source.data : draftCategories;
        setCategories(nextCategories);
        if (filters.categoryIds !== null) {
          const validIds = new Set(nextCategories.map(category => String(category.catID)));
          const nextCategoryIds = Array.from(
            new Set([
              ...filters.categoryIds,
              ...nextCategories
                .filter(category => !oldCategoryIds.has(String(category.catID)))
                .map(category => String(category.catID)),
            ]),
          ).filter(categoryId => validIds.has(categoryId));
          updateFilter({ categoryIds: nextCategoryIds }, 'categorys', nextCategoryIds.join(','));
        }

        refreshCalendar();
        alert(_l('修改成功'));
        return true;
      })
      .catch(error => {
        console.error(error);
        alertIfNotUnauthorized(error, _l('修改失败'), 3);
        return Promise.reject(error);
      });
  };

  const openCategoryEditor = () => {
    let draftCategories = categories.map((category, index) => ({
      ...category,
      clientId: `category-${category.catID}`,
      order: index + 1,
    }));
    const initialCategories = getCategoriesForUpdate(draftCategories);
    const deletedCategoryIds = new Set();
    let pendingDeleteCount = 0;
    let categoryEditorModal;

    const handleDeletingChange = deleting => {
      pendingDeleteCount = Math.max(0, pendingDeleteCount + (deleting ? 1 : -1));
      categoryEditorModal?.update({ okButtonProps: { disabled: pendingDeleteCount > 0 } });
    };

    const handleDelete = async catId => {
      const deleted = await deleteCategory(catId);
      if (deleted) deletedCategoryIds.add(String(catId));
      return deleted;
    };

    categoryEditorModal = Modal.confirm({
      wrapClassName: 'classificationCalendarEdit',
      width: 570,
      title: _l('分类日程编辑'),
      styles: { body: { overflow: 'visible' } },
      content: (
        <CategoryEditor
          initialCategories={draftCategories}
          onChange={nextCategories => (draftCategories = nextCategories)}
          onDelete={handleDelete}
          onDeletingChange={handleDeletingChange}
        />
      ),
      onOk: () => {
        if (pendingDeleteCount > 0) return false;

        const nextCategories = getCategoriesForUpdate(draftCategories);
        const unchangedCategories = initialCategories.filter(
          category => !deletedCategoryIds.has(String(category.catID)),
        );

        if (JSON.stringify(nextCategories) === JSON.stringify(unchangedCategories)) return;

        return nextCategories.length ? updateCategories(nextCategories) : undefined;
      },
    });
  };

  const openSynchronousDialog = () => {
    calendarAjax
      .getIcsUrl()
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        const url = source.data.replace(/^https?:\/\//, 'webcal://');
        Modal.confirm({
          wrapClassName: 'calendarInteraction',
          width: 644,
          footer: null,
          content: <SynchronousContent url={url} />,
        });
      })
      .catch(error => {
        console.error(error);
        alertIfNotUnauthorized(error, _l('获取日历订阅地址失败'), 3);
      });
  };

  const openInvitedCalendars = () => {
    if (inviteRequestPendingRef.current) return;
    inviteRequestPendingRef.current = true;
    setActiveContent('invites');
    document.title = `${_l('待确认日程')} - ${_l('日程')}`;
    handleLoadingChange(true);
    calendarAjax
      .invitedCalendars()
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        const data = source.data || {};
        setInviteCount(Number(data.count) || 0);
        setInvitedCalendars(
          (data.calendars || []).map(calendar => ({
            ...calendar,
            members: (calendar.members || []).filter(member => member.accountID !== calendar.createUser),
            repeat: calendar.isRecur ? formatRecur(calendar) : '',
          })),
        );
      })
      .catch(error => {
        console.error(error);
        alertIfNotUnauthorized(error, _l('待确认日程加载失败'), 3);
      })
      .finally(() => {
        inviteRequestPendingRef.current = false;
        handleLoadingChange(false);
      });
  };

  const removeInvitedCalendar = calendarId => {
    setInvitedCalendars(current => current.filter(calendar => String(calendar.id) !== String(calendarId)));
    setInviteCount(current => Math.max(0, current - 1));
  };

  const openOtherUserSelector = () => {
    const projects = md.global.Account.projects || [];
    const lastProjectId = window.localStorage.getItem('calendarLastPId');
    dialogSelectUser({
      sourceId: '',
      sourceProjectId: '',
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: projects.some(project => project.projectId === lastProjectId) ? lastProjectId : '',
        filterFriend: true,
        filterOthers: true,
        filterAccountIds: [accountId],
        filterAll: true,
        projectCallback: projectId => safeLocalStorageSetItem('calendarLastPId', projectId),
        callback: users => {
          const newUsers = users
            .filter(user => user.accountId && !filters.memberIds.includes(user.accountId))
            .map(user => ({ fullName: user.fullname, accountID: user.accountId, avatar: user.avatar }));
          if (!newUsers.length) return;
          const nextMemberIds = [...filters.memberIds, ...newUsers.map(user => user.accountID)];
          setOtherUsers(current => {
            const usersById = new Map([...newUsers, ...current].map(user => [user.accountID, user]));
            return Array.from(usersById.values());
          });
          saveMemberIds(nextMemberIds);
        },
      },
    });
  };

  const removeOtherUser = memberId => {
    const nextMemberIds = filters.memberIds.filter(id => id !== memberId);
    setOtherUsers(current => current.filter(user => user.accountID !== memberId));
    saveMemberIds(nextMemberIds.length ? nextMemberIds : [accountId]);
  };

  const clearOtherUsers = () => {
    setOtherUsers([]);
    setFilters(current => ({ ...current, memberIds: [accountId] }));
    window.localStorage.removeItem(`otherUsers${accountId}`);
  };

  const isSelfHidden = !filters.memberIds.includes(accountId);
  const calendarMenuItems = useMemo(
    () => [
      {
        key: 'invites',
        icon: <Icon icon="calendar-confirmed" className="Font16 textSecondary" />,
        label: _l('待确认日程'),
        extra: inviteCount ? <Badge count={inviteCount} /> : null,
      },
      {
        key: 'synchronous',
        icon: <Icon icon="loop" className="Font16 textSecondary" />,
        label: _l('同步日程到其他应用'),
      },
    ],
    [inviteCount],
  );

  const toggleSelf = () => {
    const nextMemberIds = isSelfHidden
      ? [accountId, ...filters.memberIds]
      : filters.memberIds.filter(memberId => memberId !== accountId);
    saveMemberIds(nextMemberIds);
  };

  return (
    <>
      <aside className="calendarMenu bgPrimary flexColumn">
        <Menu
          className="calendarMenuTop"
          mode="vertical"
          items={calendarMenuItems}
          selectedKeys={activeContent === 'invites' ? ['invites'] : []}
          styles={CALENDAR_MENU_STYLES}
          onClick={({ key }) => {
            if (key === 'invites') {
              openInvitedCalendars();
            } else if (key === 'synchronous') {
              openSynchronousDialog();
            }
          }}
        />
        <div className="calendarType flex">
          <div className="calendarTypeTitle boxSizing relative">
            <span className="textSecondary">{_l('分类日程')}</span>
            <Icon icon="edit" className="pointer textSecondary addCalendarType" onClick={openCategoryEditor} />
          </div>
          <div className="calendarTypeList">
            <CalendarTypeList
              categories={categories.map(category => ({
                ...category,
                colorClassName: getCategoryColorClass(category.color),
              }))}
              filterTaskType={filters.filterTaskType}
              isLoading={categoriesLoading}
              isTaskCalendar={filters.isTaskCalendar}
              isWorkCalendar={filters.isWorkCalendar}
              selectedCategoryIds={selectedCategoryIds}
              onWorkCalendarChange={checked => updateFilter({ isWorkCalendar: checked }, 'isWorkCalendar', checked)}
              onTaskCalendarChange={checked => updateFilter({ isTaskCalendar: checked }, 'isTaskCalendar', checked)}
              onCategoryChange={handleCategoryChange}
              onFilterTaskTypeChange={taskType =>
                updateFilter({ filterTaskType: taskType }, 'filterTaskType', taskType)
              }
            />
          </div>
          {!!otherUsers.length && (
            <>
              <div className="hideOneself textSecondary">
                <span
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={isSelfHidden}
                  aria-label={_l('隐藏我的日程')}
                  className={`cbComplete ${isSelfHidden ? 'icon-calendar-check' : 'icon-calendar-nocheck'} textTertiary`}
                  onClick={toggleSelf}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleSelf();
                    }
                  }}
                />
                {_l('隐藏我的日程')}
                <span className="allOtherUserDel textSecondary" onClick={clearOtherUsers}>
                  {_l('清空全部')}
                </span>
              </div>
              <div className="tbOtherUserCalendar textSecondary">
                <OtherUserList users={otherUsers} onDelete={removeOtherUser} />
              </div>
            </>
          )}
        </div>
        {!!md.global.Account.projects?.length && (
          <div className="selectOther">
            <Button
              color="default"
              variant="link"
              title={_l('查看同事日程')}
              icon={<Icon icon="charger" className="iconSelectOther" />}
              onClick={openOtherUserSelector}
            >
              {_l('查看同事日程')}
            </Button>
          </div>
        )}
      </aside>

      <main className="calendarMain boxSizing">
        {activeContent === 'invites' ? (
          <div className="invitedMain">
            <Button
              className="exitInvited"
              color="primary"
              variant="solid"
              icon={<Icon icon="backspace" />}
              onClick={() => {
                document.title = _l('日程');
                refreshCalendar();
              }}
            >
              {_l('返回我的日程')}
            </Button>
            <ul className="invitedCalendars calendarInvite boxSizing">
              <InviteCalendarList
                calendars={invitedCalendars}
                categories={categories}
                getColor={getInviteColor}
                formatInviteData={formatInviteData}
                onConfirm={(calendarId, recurTime, categoryId) =>
                  Comm.inviteCalendar.confirm(calendarId, recurTime, categoryId, {
                    onSuccess: () => removeInvitedCalendar(calendarId),
                  })
                }
                onRefuse={(calendarId, recurTime, onClose) =>
                  Comm.inviteCalendar.refuse(calendarId, recurTime, {
                    onClose,
                    onSuccess: () => removeInvitedCalendar(calendarId),
                  })
                }
              />
            </ul>
          </div>
        ) : categoriesLoading ? null : (
          <CalendarView
            filters={filters}
            initialDate={calendarPosition.date}
            initialView={calendarPosition.view}
            refreshToken={refreshToken}
            onLoadingChange={handleLoadingChange}
            onOpenTask={taskId => setTaskDetail({ visible: true, taskId })}
            onOpenDetail={setCalendarDetail}
            onPositionChange={changes => setCalendarPosition(current => ({ ...current, ...changes }))}
          />
        )}
        {(isLoading || categoriesLoading) && (
          <div className="calendarLoading" role="status" aria-label={_l('加载中')}>
            <LoadDiv />
          </div>
        )}
      </main>

      <TaskDetail
        visible={taskDetail.visible}
        taskId={taskDetail.taskId}
        openType={3}
        closeCallback={() => setTaskDetail({ visible: false, taskId: '' })}
        updateCallback={refreshCalendar}
      />

      {calendarDetail && (
        <CalendarDetailContainer
          calendarId={calendarDetail.calendarId}
          recurTime={calendarDetail.recurTime}
          onChange={refreshCalendar}
          onClose={() => setCalendarDetail(null)}
        />
      )}
    </>
  );
}
