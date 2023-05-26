import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { RadioGroup, Dialog, Checkbox, Button } from 'ming-ui';
import './less/DeleteReconfirm.less';
import _ from 'lodash';

const noop = () => {};

export default ({
  style,
  footer,
  className,
  description,
  title,
  data,
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
        .removeProp('disabled')
        .removeClass('Button--disabled')
        .on('click', () => {
          handleClick('ok');
        });
    } else {
      $('.deleteReconfirmFooter .deleteReconfirmOkBtn').prop('disabled', true).addClass('Button--disabled');
    }
  };

  const closeLayer = () => {
    setTimeout(() => {
      const isUnmounted = ReactDOM.unmountComponentAtNode(container);
      isUnmounted && container.parentNode && container.parentNode.removeChild(container);
      onCancel && onCancel();
    }, 0);
  };

  ReactDOM.render(
    <Dialog
      style={style}
      className={className}
      visible
      title={<span style={{ color: '#f44336' }}>{title}</span>}
      onCancel={closeLayer}
      description={description}
      footer={_.isUndefined(footer) ? renderFooter() : footer}
    >
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
    </Dialog>,
    container,
  );
};
