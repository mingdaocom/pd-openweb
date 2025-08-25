import React, { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { Button, Checkbox, Dialog, RadioGroup } from 'ming-ui';
import './less/DeleteReconfirm.less';

const noop = () => {};

export default ({
  style,
  bodyStyle = {},
  footer,
  className,
  description,
  title,
  data,
  expandBtn,
  onOk = noop,
  onCancel = noop,
  clickOmitText = false,
}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let confirmValue;

  const handleClick = type => {
    if (type === 'cancel') {
      onCancel();
    }
    if (type === 'ok') {
      onOk(confirmValue);
    }
    closeLayer();
  };

  const renderFooter = () => {
    return (
      <div className="deleteReconfirmFooter">
        {expandBtn}
        <Button type="link" onClick={() => handleClick('cancel')}>
          {_l('取消')}
        </Button>
        <Button type="danger" disabled className="deleteReconfirmOkBtn Button--disabled">
          {_l('删除')}
        </Button>
      </div>
    );
  };

  const onChange = value => {
    confirmValue = value;
    if (_.find(data, item => item.value === value)) {
      $('.deleteReconfirmFooter .deleteReconfirmOkBtn')
        .removeAttr('disabled')
        .removeClass('Button--disabled')
        .on('click', () => {
          handleClick('ok');
        });
    } else {
      $('.deleteReconfirmFooter .deleteReconfirmOkBtn').prop('disabled', true).addClass('Button--disabled');
    }
  };

  const root = createRoot(container);
  const closeLayer = () => {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
      onCancel && onCancel();
    }, 0);
  };

  root.render(
    <Dialog
      style={style}
      className={className}
      visible
      title={<span style={{ color: '#f44336' }}>{title}</span>}
      onCancel={closeLayer}
      description={description}
      footer={_.isUndefined(footer) ? renderFooter() : footer}
    >
      <div style={bodyStyle}>
        {data.length > 1 ? (
          <RadioGroup
            needDefaultUpdate
            data={data}
            vertical
            radioItemClassName="deleteReconfirmRadioItem"
            onChange={onChange}
          />
        ) : (
          <div>
            {data.map(({ text, value }) =>
              clickOmitText ? (
                <Fragment key={value}>
                  <Checkbox
                    style={{ display: 'inline' }}
                    value={value}
                    text={null}
                    onClick={(checkd, value) => onChange(checkd ? value : undefined)}
                  />
                  <span>{text}</span>
                </Fragment>
              ) : (
                <Checkbox value={value} text={text} onClick={(checkd, value) => onChange(checkd ? value : undefined)} />
              ),
            )}
          </div>
        )}
      </div>
    </Dialog>,
  );
};
