import React from 'react';
import theme from 'antd/es/theme';
import Checkbox from '../Checkbox';
import Modal from '../Modal';
import Radio from '../Radio';

const noop = () => {};

function DeleteReconfirmContent({ bodyStyle = {}, description, data = [], onChange }) {
  const { token } = theme.useToken();

  return (
    <>
      {description && <div style={{ marginBottom: token.marginMD, lineHeight: token.lineHeight }}>{description}</div>}
      <div style={bodyStyle}>
        {data.length > 1 ? (
          <Radio.Group
            options={data.map(({ text, ...option }) => ({ ...option, label: text }))}
            vertical
            onChange={event => onChange(event.target.value)}
          />
        ) : (
          <div>
            {data.map(({ text, value }) => (
              <Checkbox
                key={value}
                value={value}
                onChange={event => onChange(event.target.checked ? value : undefined)}
              >
                {text}
              </Checkbox>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function deleteReconfirm({
  style,
  bodyStyle = {},
  footer,
  className,
  description,
  title,
  data = [],
  expandBtn,
  onOk = noop,
  onCancel = noop,
} = {}) {
  const { width = 480, ...modalStyle } = style || {};
  let confirmValue;
  let modal;

  const handleChange = value => {
    confirmValue = value;
    modal.update(previousConfig => ({
      ...previousConfig,
      okButtonProps: {
        ...previousConfig.okButtonProps,
        disabled: !data.some(item => item.value === value),
      },
    }));
  };

  modal = Modal.confirm({
    className,
    width,
    style: modalStyle,
    title: <span className="textError">{title}</span>,
    content: (
      <DeleteReconfirmContent bodyStyle={bodyStyle} description={description} data={data} onChange={handleChange} />
    ),
    footer,
    footerLeftElement: footer === undefined ? expandBtn : undefined,
    okText: _l('删除'),
    cancelText: _l('取消'),
    okButtonProps: {
      className: 'deleteReconfirmOkBtn',
      danger: true,
      disabled: true,
    },
    centered: true,
    keyboard: true,
    mask: { closable: true },
    onOk: () => onOk(confirmValue),
    onCancel,
  });
}

export default deleteReconfirm;
