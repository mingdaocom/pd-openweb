import React, { lazy, Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';

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
        color: var(--color-primary) !important;
      }
    }
  }
`;
const LoadableViewPreview = lazy(() =>
  import('src/pages/customPage/components/editWidget/view/Preview').then(component => ({
    default: component.View,
  })),
);

export default function EmbedPreview(props) {
  const { setting: { config = {} } = {} } = props;
  return useMemo(() => {
    return (
      <Wrap>
        <Suspense fallback={<LoadDiv className="mTop10" />}>
          <LoadableViewPreview {...props} />
        </Suspense>
      </Wrap>
    );
  }, [config.embedNeedUpdate]);
}
