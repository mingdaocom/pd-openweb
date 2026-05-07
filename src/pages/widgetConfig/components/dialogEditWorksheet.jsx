import React from 'react';
import { Provider } from 'react-redux';
import { Dialog, FunctionWrap } from 'ming-ui';
import { GlobalStoreProvider } from 'src/common/GlobalStore';
import store from 'src/redux/configureStore';

export default function dialogEditWorksheet(props) {
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;

  import('../index').then(module => {
    const Container = module.default;

    const Content = contentProps => (
      <Dialog
        width={width}
        className="DialogWidgetConfig"
        overlayClosable={false}
        visible
        type="fixed"
        title={null}
        footer={null}
      >
        <Provider store={store}>
          <GlobalStoreProvider>
            <Container {...contentProps} isDialog handleClose={() => contentProps.onClose()} />
          </GlobalStoreProvider>
        </Provider>
      </Dialog>
    );

    FunctionWrap(Content, { ...props });
  });
}
