import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Status } from '@strapi/design-system/Status';
import { Typography } from '@strapi/design-system/Typography';
import { Box } from '@strapi/design-system/Box';

import { useCacheStrategy } from '../../hooks';

function EntityCacheInformation({ contentType }) {
  const { strategy } = useCacheStrategy();
  const { formatMessage } = useIntl();

  if (
    !strategy?.contentTypes?.find(
      (config) => config.contentType === contentType
    )
  ) {
    return null;
  }

  return (
    <Box paddingTop={2}>
      <Status variant="neutral">
        <Typography>
          {formatMessage({
            id: 'cache.info-box.entity-cached',
            defaultMessage: 'This entity is cached via REST Cache plugin',
          })}
        </Typography>
      </Status>
    </Box>
  );
}

EntityCacheInformation.propTypes = {
  contentType: PropTypes.string.isRequired,
};

export default EntityCacheInformation;
