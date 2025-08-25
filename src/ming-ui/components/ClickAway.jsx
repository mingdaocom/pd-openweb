import React from 'react';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default function ClickAway(props) {
  const { onClickAway, onClickAwayExceptions } = props;
  return (
    <ClickAwayable onClickAway={onClickAway} onClickAwayExceptions={onClickAwayExceptions}>
      {props.children}
    </ClickAwayable>
  );
}
