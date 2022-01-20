import React from 'react';
import { useCMEditViewDataManager, useRBAC } from '@strapi/helper-plugin';

import cachePermissions from '../../permissions';
import EntityCacheInformation from '../EntityCacheInformation';

function EditViewInfoInjectedComponent() {
  const { allowedActions } = useRBAC(cachePermissions);
  const { slug } = useCMEditViewDataManager();

  if (!allowedActions.canReadStrategy) {
    return null;
  }

  return <EntityCacheInformation contentType={slug} />;
}

export default EditViewInfoInjectedComponent;
