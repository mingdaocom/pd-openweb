import homeAppAjax from 'src/api/homeApp';

export const getAppList = () => dispatch => {
  dispatch({
    type: 'MOBILE_FETCHHOMELIST_START',
  });
  Promise.all([homeAppAjax.getAllHomeApp().then()]).then(res => {
    dispatch({
      type: 'UPDATE_APPHOMELIST',
      data: res,
    });
    dispatch({
      type: 'MOBILE_FETCHHOMELIST_SUCCESS',
    });
  });
};

export const getMyApp = projectId => dispatch => {
  dispatch({
    type: 'MOBILE_FETCHHOMELIST_START',
  });
  homeAppAjax.getMyApp({ projectId }).then(res => {
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
      type: 'MOBILE_FETCHHOMELIST_SUCCESS',
    });
  });
};
