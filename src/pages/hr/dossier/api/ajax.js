const baseConfig = {
  cache: false,
  dataType: 'json',
  contentType: 'application/json; charset=utf-8',
  beforeSend: (xhr) => {
    xhr.setRequestHeader('accessToken', localStorage.getItem('plus_accessToken'));
  },
};

const ORIGIN_HOST_NAME = () => md.global.Config.HrDossierUrl;

function ajax(options) {
  const { type, config } = options;
  let { url, args } = options;

  // if (localStorage.getItem('plus_projectId') === 'faa2f6b1-f706-4084-9a8d-50616817f890') {
  //   url = 'https://dossierdemo.mingdao.com' + url;
  // } else {
    url = ORIGIN_HOST_NAME() + url;
  // }
  args = type !== 'GET' ? JSON.stringify(args) : args;
  return $.ajax(
    Object.assign(
      {},
      baseConfig,
      {
        data: args,
        type,
        url,
      },
      config
    )
  ).fail((err) => {
    if (err.status === 500) {
      alert(_l('服务器出错'), 2);
    }
  });
}

function ajaxFile(options) {
  let { url } = options;
  url = ORIGIN_HOST_NAME() + url;
  const { args } = options;
  return $.ajax(
    Object.assign({}, baseConfig, {
      async: false,
      contentType: false, // 这个一定要写
      processData: false, // 这个也一定要写，不然会报错
      dataType: 'json',
      data: args,
      type: 'POST',
      url,
    })
  );
}

function ajaxGet(options) {
  return ajax(
    Object.assign({}, options, {
      type: 'GET',
    })
  );
}

function ajaxPost(options) {
  return ajax(
    Object.assign({}, options, {
      type: 'POST',
    })
  );
}

function ajaxPut(options) {
  return ajax(
    Object.assign({}, options, {
      type: 'PUT',
    })
  );
}

function ajaxDelete(options) {
  return ajax(
    Object.assign({}, options, {
      type: 'DELETE',
    })
  );
}

function ajaxPatch(options) {
  return ajax(
    Object.assign({}, options, {
      type: 'PATCH',
    })
  );
}

function open(path) {
  window.open(ORIGIN_HOST_NAME() + path);
}

export default {
  get: ajaxGet,
  post: ajaxPost,
  delete: ajaxDelete,
  put: ajaxPut,
  patch: ajaxPatch,
  file: ajaxFile,
  open,
};
