import homeAppAjax from 'src/api/homeApp';


export const getAppList = () => (dispatch) => {
  dispatch({
    type: 'MOBILE_FETCHHOMELIST_START',
  });
  Promise.all([
    homeAppAjax.getAllHomeApp().then(),
  ]).then(res => {
    dispatch({
      type: 'UPDATE_APPHOMELIST',
      data: res,
    });
    dispatch({
      type: 'MOBILE_FETCHHOMELIST_SUCCESS',
    });
  });
};
