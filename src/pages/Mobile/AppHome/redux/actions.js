import _ from 'lodash';
import appManagementApi from 'src/api/appManagement';
import favoriteAjax from 'src/api/favorite';
import homeAppAjax from 'src/api/homeApp';

export const getMyApp = (projectId, isPullRefresh) => dispatch => {
  if (!isPullRefresh) {
    dispatch({ type: 'MOBILE_FETCHHOMELIST_START' });
  }

  homeAppAjax.getMyApp({ projectId, containsLinks: true }).then(res => {
    const { markedGroupIds = [], personalGroups = [], projectGroups = [], apps = [] } = res;
    let markedGroup = markedGroupIds
      .map(id => _.find([...personalGroups, ...projectGroups], { id }))
      .filter(_.identity)
      .map(it => ({
        apps: apps.filter(v => _.includes(v.groupIds, it.id)),
        ...it,
      }));
    dispatch({
      type: 'UPDATE_MYAPPLIST',
      data: { ...res, markedGroup },
    });
    dispatch({
      type: 'PLATE_FORM_DATA',
      data: { ...res, markedGroup },
    });
    dispatch({
      type: 'MOBILE_FETCHHOMELIST_SUCCESS',
    });
  });
};

export const markedGroup =
  ({ id, isMarked, groupType, projectId }) =>
  (dispatch, getState) => {
    homeAppAjax.markedGroup({ id, isMarked, groupType, projectId }).then(res => {
      if (res) {
        const { myAppData = {} } = getState().mobile || {};
        const personalGroups =
          groupType === 0
            ? (myAppData.personalGroups || []).map(item => {
                if (item.id === id) {
                  return { ...item, isMarked };
                }
                return item;
              })
            : myAppData.personalGroups;
        const projectGroups =
          groupType === 1
            ? (myAppData.projectGroups || []).map(item => {
                if (item.id === id) {
                  return { ...item, isMarked };
                }
                return item;
              })
            : myAppData.projectGroups;
        const groups = groupType === 0 ? personalGroups : projectGroups;

        dispatch({
          type: 'UPDATE_MYAPPLIST',
          data: {
            ...myAppData,
            personalGroups,
            projectGroups,
            markedGroup: _.unionBy(
              isMarked
                ? myAppData.markedGroup.concat(_.find(groups, { id })).filter(_.identity)
                : myAppData.markedGroup.filter(it => it.id !== id),
              'id',
            ),
          },
        });
        isMarked ? alert(_l('星标成功')) : alert(_l('取消星标成功'));
      } else {
        isMarked ? alert(_l('星标失败'), 2) : alert(_l('取消星标失败'), 2);
      }
    });
  };

export const getHomePlatformSetting = projectId => dispatch => {
  homeAppAjax.getHomePlatformSetting({ projectId }).then(res => {
    dispatch({
      type: 'PLATE_FORM_SETTING',
      data: res,
    });
  });
};
export const myPlatform = (projectId, isPullRefresh) => dispatch => {
  if (!isPullRefresh) {
    dispatch({ type: 'MOBILE_FETCHHOMELIST_START' });
  }

  Promise.all([
    homeAppAjax.myPlatform({ projectId, containsLinks: true }),
    projectId ? homeAppAjax.myPlatformLang({ projectId, noCache: false }) : undefined,
    projectId ? appManagementApi.getProjectLangs({ projectId, type: 20 }) : undefined,
  ]).then(result => {
    const [platformRes, langRes = [], projectGroupsLang = []] = result;
    const { markedGroupIds = [], personalGroups = [], projectGroups = [], apps = [] } = platformRes;
    let markedGroup = markedGroupIds
      .map(id => _.find([...personalGroups, ...projectGroups], { id }))
      .filter(_.identity)
      .map(it => ({
        apps: apps.filter(v => _.includes(v.groupIds, it.id)),
        ...it,
      }));
    dispatch({
      type: 'MOBILE_FETCHHOMELIST_SUCCESS',
    });
    dispatch({
      type: 'PLATE_FORM_LANG',
      data: langRes,
    });
    dispatch({
      type: 'PLATE_FORM_DATA',
      data: { ...platformRes, markedGroup },
    });
    dispatch({
      type: 'PROJECT_GROUPS_NAME_LANG',
      data: _.keyBy(
        projectGroupsLang.filter(o => o.langType === getCurrentLangCode()),
        'correlationId',
      ),
    });
  });
};

export const getAllFavorites = projectId => dispatch => {
  favoriteAjax.getAllFavorites({ projectId, isRefresh: 1 }).then(res => {
    dispatch({
      type: 'COLLECT_RECORDS',
      data: res,
    });
  });
};

export const getAllCollectCharts = projectId => dispatch => {
  favoriteAjax.getAllFavorites({ projectId, type: 2, isRefresh: 1 }).then(res => {
    dispatch({
      type: 'COLLECT_CHARTS',
      data: res,
    });
  });
};

export const clearAllCollectCharts = () => dispatch => {
  dispatch({
    type: 'COLLECT_CHARTS',
    data: [],
  });
};

export const updateAppHomeScrollY = scrollY => dispatch => {
  dispatch({
    type: 'APP_HOME_SCROLL_Y',
    data: scrollY,
  });
};
