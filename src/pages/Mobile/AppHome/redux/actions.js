import _ from 'lodash';
import homeAppAjax from 'src/api/homeApp';
import favoriteAjax from 'src/api/favorite';

export const getMyApp = projectId => dispatch => {
  dispatch({
    type: 'MOBILE_FETCHHOMELIST_START',
  });
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
export const myPlatform = projectId => dispatch => {
  dispatch({
    type: 'MOBILE_FETCHHOMELIST_START',
  });
  homeAppAjax.myPlatform({ projectId, containsLinks: true }).then(res => {
    const { markedGroupIds = [], personalGroups = [], projectGroups = [], apps = [] } = res;
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
      type: 'PLATE_FORM_DATA',
      data: { ...res, markedGroup },
    });
  });
};

export const getAllFavorites = projectId => (dispatch, getState) => {
  favoriteAjax.getAllFavorites({ projectId, isRefresh: 1 }).then(res => {
    dispatch({
      type: 'COLLECT_RECORDS',
      data: res,
    });
  });
};
