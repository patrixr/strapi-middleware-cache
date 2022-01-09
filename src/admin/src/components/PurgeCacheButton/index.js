import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@strapi/design-system/Button';
import Refresh from '@strapi/icons/Refresh';
import get from 'lodash/get';
import { ConfirmDialog, useNotification } from '@strapi/helper-plugin';

function PurgeCacheButton() {
  const [showWarningDelete, setWarningDelete] = useState(false);
  const [isModalConfirmButtonLoading, setIsModalConfirmButtonLoading] =
    useState(false);
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();

  const toggleWarningDelete = () => setWarningDelete((prevState) => !prevState);

  const handleConfirmDelete = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      toggleNotification({
        type: 'success',
        message: {
          id: 'notification.cache.purge.success',
          defaultMessage: 'Cache purged successfully',
        },
      });

      // await onDelete(trackerProperty);

      setIsModalConfirmButtonLoading(false);

      toggleWarningDelete();
    } catch (err) {
      const errorMessage = get(
        err,
        'response.payload.message',
        formatMessage({ id: 'test' })
      );
      setIsModalConfirmButtonLoading(false);
      toggleWarningDelete();
      console.log(err);
      console.log(errorMessage);
      toggleNotification({ type: 'warning', message: errorMessage });
    }
  };

  return (
    <>
      <Button
        onClick={toggleWarningDelete}
        size="S"
        startIcon={<Refresh />}
        variant="danger"
      >
        {formatMessage({
          id: 'containers.Edit.delete-entry',
          defaultMessage: 'Purge cache',
        })}
      </Button>
      <ConfirmDialog
        isConfirmButtonLoading={isModalConfirmButtonLoading}
        isOpen={showWarningDelete}
        onConfirm={handleConfirmDelete}
        onToggleDialog={toggleWarningDelete}
        title={{
          id: 'containers.Edit.purge-entity-modal-title',
          defaultMessage: 'Confirm purging cache?',
        }}
        bodyText={{
          id: 'containers.Edit.purge-entity-modal-body',
          defaultMessage:
            'Are you sure you want to purge cache for this entry?',
        }}
        iconRightButton={<Refresh />}
        rightButtonText={{
          id: 'containers.Edit.purge-entity-modal-confirm',
          defaultMessage: 'Purge cache',
        }}
      />
    </>
  );
}

export default PurgeCacheButton;
