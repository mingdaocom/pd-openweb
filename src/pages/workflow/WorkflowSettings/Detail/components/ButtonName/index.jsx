import React, { Fragment } from 'react';

export default ({ dataKey, name, buttonName, onChange }) => {
  return (
    <Fragment>
      <div className="Font13 Gray_9e mTop10">{buttonName}</div>
      <div className="flexRow">
        <input
          type="text"
          className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop10"
          defaultValue={name}
          onChange={evt => onChange({ [dataKey]: evt.currentTarget.value })}
        />
      </div>
    </Fragment>
  );
};
