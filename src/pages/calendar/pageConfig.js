const VALID_VIEWS = ['agendaDay', 'agendaWeek', 'month', 'list'];

export const getInitialSettings = () => {
  const query = new URLSearchParams(window.location.search);
  const accountId = md.global.Account.accountId;
  const storedOtherUsers = window.localStorage.getItem(`otherUsers${accountId}`);
  const queryView = query.get('view');
  const storedView = window.localStorage.getItem('lastView');
  const initialView = VALID_VIEWS.includes(queryView)
    ? queryView
    : VALID_VIEWS.includes(storedView)
      ? storedView
      : 'agendaDay';
  let memberIds = storedOtherUsers ? storedOtherUsers.split(',').filter(Boolean) : [accountId];

  if (queryView === 'agendaWeek' && query.get('userID')) {
    memberIds = Array.from(new Set([accountId, query.get('userID')]));
  }

  const storedCategories = window.localStorage.getItem('categorys');
  return {
    initialDate: query.get('date') || new Date(),
    initialView,
    filters: {
      categoryIds: storedCategories === null ? null : storedCategories.split(',').filter(Boolean),
      isWorkCalendar:
        window.localStorage.getItem('isWorkCalendar') === null ||
        window.localStorage.getItem('isWorkCalendar') === 'true',
      isTaskCalendar:
        window.localStorage.getItem('isTaskCalendar') === null ||
        window.localStorage.getItem('isTaskCalendar') === 'true',
      filterTaskType: window.localStorage.getItem('filterTaskType') || '2',
      memberIds,
    },
  };
};
