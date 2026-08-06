import React from 'react';
import ClickAway from 'ming-ui/components/ClickAway';

let DepartmentAction = class DepartmentAction extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isShowAct = false, isTop = false, isPosition = false, deleteFn, setToTop } = this.props;

    if (!isShowAct) {
      return '';
    }

    return (
      <ul>
        {!isTop && !isPosition && (
          <li
            onClick={() => {
              setToTop();
            }}
          >
            {_l('设为主属部门')}
          </li>
        )}
        <li
          onClick={() => {
            deleteFn();
          }}
        >
          {_l('删除')}
        </li>
      </ul>
    );
  }
};
DepartmentAction = ClickAway.wrap(DepartmentAction);
export default DepartmentAction;
