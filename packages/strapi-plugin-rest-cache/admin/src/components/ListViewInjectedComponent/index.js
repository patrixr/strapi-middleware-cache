import React from 'react';
// import { useIntl } from 'react-intl';
// import { Button } from '@strapi/design-system/Button';
// import Refresh from '@strapi/icons/Refresh';
import {
  // ConfirmDialog,
  // useNotification,
  // hasPermissions,
  // useRBACProvider,
  // useCMEditViewDataManager,
  useRBAC,
  // request,
} from '@strapi/helper-plugin';
import { useRouteMatch } from 'react-router-dom';
// import cachePermissions from '../../permissions';
import cachePermissions from '../../permissions';
import PurgeCacheButton from '../PurgeCacheButton';

function ListViewInjectedComponent() {
  const {
    params: { slug },
  } = useRouteMatch('/content-manager/:kind/:slug?');
  const { allowedActions } = useRBAC(cachePermissions);

  if (!allowedActions.canReadStrategy || !allowedActions.canPurge) {
    return null;
  }

  return <PurgeCacheButton contentType={slug} wildcard />;
}

export default ListViewInjectedComponent;
