import React, { Fragment, useEffect, useRef } from 'react';

export default ({ dataKey, name, buttonName, onChange }) => {
  const buttonNameInput = useRef(null);

  useEffect(() => {
    if (buttonNameInput.current.value !== name) {
      buttonNameInput.current.value = name;
    }
  }, [name]);

  return (
    <Fragment>
      <div className="Font13 Gray_75 mTop10">{buttonName}</div>
      <div className="flexRow">
        <input
          type="text"
          ref={buttonNameInput}
          className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop10"
          defaultValue={name}
          onChange={evt => onChange({ [dataKey]: evt.currentTarget.value })}
        />
      </div>
    </Fragment>
  );
};
