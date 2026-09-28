import { useContext, useMemo } from 'react';
import { containerBaseZIndexOffset } from 'antd/es/_util/hooks/useZIndex';
import ZIndexContext from 'antd/es/_util/zindexContext';
import AntdModal from 'antd/es/modal';

const MODAL_METHODS = ['info', 'success', 'error', 'warning', 'confirm'];
const getOriginalConfig = config => config;

export const getContextualModalConfig = (config, parentZIndex) => {
  if (!Number.isFinite(parentZIndex) || config?.zIndex !== undefined) return config;

  return {
    ...(config || {}),
    zIndex: parentZIndex + containerBaseZIndexOffset.Modal,
  };
};

export const createModalApi = (modal, parentZIndex, getModalConfig = getOriginalConfig) => {
  const modalApi = { ...modal };

  MODAL_METHODS.forEach(method => {
    if (typeof modal[method] !== 'function') return;

    modalApi[method] = config => modal[method](getModalConfig(getContextualModalConfig(config, parentZIndex)));
  });

  return modalApi;
};

export default function useModal(getModalConfig = getOriginalConfig) {
  const parentZIndex = useContext(ZIndexContext);
  const [modal, contextHolder] = AntdModal.useModal();
  const modalApi = useMemo(
    () => createModalApi(modal, parentZIndex, getModalConfig),
    [getModalConfig, modal, parentZIndex],
  );

  return [modalApi, contextHolder];
}
