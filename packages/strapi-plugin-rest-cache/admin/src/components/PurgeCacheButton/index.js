import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@strapi/design-system/Button';
import Refresh from '@strapi/icons/Refresh';
import { ConfirmDialog, useNotification, request } from '@strapi/helper-plugin';
import PropTypes from 'prop-types';

import pluginId from '../../pluginId';
import { useCacheStrategy } from '../../hooks';

function PurgeCacheButton({ contentType, params, wildcard }) {
  const { strategy } = useCacheStrategy();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalConfirmButtonLoading, setIsModalConfirmButtonLoading] =
    useState(false);
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();

  const abortController = new AbortController();
  const { signal } = abortController;

  useEffect(() => {
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleConfirmModal = () =>
    setShowConfirmModal((prevState) => !prevState);

  const handleConfirmDelete = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      await request(`/${pluginId}/purge`, {
        method: 'POST',
        signal,
        body: {
          contentType,
          params,
          wildcard,
        },
      });

      toggleNotification({
        type: 'success',
        message: {
          id: 'cache.purge.success',
          defaultMessage: 'Cache purged successfully',
        },
      });

      setIsModalConfirmButtonLoading(false);

      toggleConfirmModal();
    } catch (err) {
      const errorMessage = err?.response?.payload?.error?.message;
      setIsModalConfirmButtonLoading(false);
      toggleConfirmModal();

      if (errorMessage) {
        toggleNotification({
          type: 'warning',
          message: { id: 'cache.purge.error', defaultMessage: errorMessage },
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: { id: 'notification.error' },
        });
      }
    }
  };

  if (
    !strategy?.contentTypes?.find(
      (config) => config.contentType === contentType
    )
  ) {
    return null;
  }

  return (
    <>
      <Button
        onClick={toggleConfirmModal}
        size="S"
        startIcon={<Refresh />}
        variant="danger"
      >
        {formatMessage({
          id: 'cache.purge.delete-entry',
          defaultMessage: 'Purge REST Cache',
        })}
      </Button>
      <ConfirmDialog
        isConfirmButtonLoading={isModalConfirmButtonLoading}
        isOpen={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onToggleDialog={toggleConfirmModal}
        title={{
          id: 'cache.purge.confirm-modal-title',
          defaultMessage: 'Confirm purging REST Cache?',
        }}
        bodyText={{
          id: 'cache.purge.confirm-modal-body',
          defaultMessage:
            'Are you sure you want to purge REST Cache for this entry?',
        }}
        iconRightButton={<Refresh />}
        rightButtonText={{
          id: 'cache.purge.confirm-modal-confirm',
          defaultMessage: 'Purge REST Cache',
        }}
      />
    </>
  );
}

PurgeCacheButton.propTypes = {
  contentType: PropTypes.string.isRequired,
  params: PropTypes.object,
  wildcard: PropTypes.bool,
};
PurgeCacheButton.defaultProps = {
  params: {},
  wildcard: undefined,
};

export default PurgeCacheButton;
