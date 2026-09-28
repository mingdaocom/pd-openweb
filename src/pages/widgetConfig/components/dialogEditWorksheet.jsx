import React, { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { GlobalStoreProvider } from 'src/common/providers/GlobalStore';
import store from 'src/redux/configureStore';

const EDIT_WORKSHEET_MODAL_STYLES = {
  container: { padding: 0, overflow: 'hidden' },
};

const WidgetConfig = lazy(() => import('../index'));

function EditWorksheetDialog(props) {
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;

  return (
    <Modal
      width={width}
      className="DialogWidgetConfig"
      styles={EDIT_WORKSHEET_MODAL_STYLES}
      mask={{ closable: false }}
      closable={false}
      open
      type="fixed"
    >
      <Suspense fallback={null}>
        <Provider store={store}>
          <GlobalStoreProvider>
            <WidgetConfig {...props} isDialog handleClose={() => props.onClose()} />
          </GlobalStoreProvider>
        </Provider>
      </Suspense>
    </Modal>
  );
}

export default function useEditWorksheetDialog() {
  return useFunctionWrapComponent(EditWorksheetDialog);
}
