import React from 'react';
import ReactDOM from 'react-dom';

export default function(Comp, props) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  function destory() {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
  ReactDOM.render(
    <Comp
      visible
      onClose={destory}
      onCancel={destory}
      {...(props.closeFnName ? { [props.closeFnName]: destory } : {})}
      {...props}
    />,
    div,
  );
}
