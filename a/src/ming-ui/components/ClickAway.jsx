import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);

export default function ClickAway(props) {
  const { onClickAway, onClickAwayExceptions, ...rest } = props;
  return <ClickAwayable
  onClickAway={onClickAway}
  onClickAwayExceptions={onClickAwayExceptions}
  >
    { props.children }
  </ClickAwayable>;
}
