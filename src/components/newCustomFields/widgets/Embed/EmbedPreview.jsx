import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 24px;
  min-width: 0;

  .SingleViewHeader {
    .icon-search,
    .icon-task-later {
      &:hover {
        color: #1677ff !important;
      }
    }
  }
`;

export default function EmbedPreview(props) {
  const { needUpdate } = props;
  const [ViewComponent, setComponent] = useState(null);

  useEffect(() => {
    import('src/pages/customPage/components/editWidget/view/Preview').then(component => {
      setComponent(component);
    });
  }, []);

  return useMemo(() => {
    return <Wrap>{ViewComponent ? <ViewComponent.View {...props} /> : null}</Wrap>;
  }, [needUpdate, ViewComponent]);
}
