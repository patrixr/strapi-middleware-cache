import React from 'react';
// import { useIntl } from 'react-intl';
// import { Button } from '@strapi/design-system/Button';
// import Refresh from '@strapi/icons/Refresh';
// import get from 'lodash/get';
import // ConfirmDialog,
// useNotification,
// hasPermissions,
// useRBACProvider,
// useCMEditViewDataManager,
// request,
'@strapi/helper-plugin';
// import { useRouteMatch } from 'react-router-dom';
// import cachePermissions from '../../permissions';
import PurgeCacheButton from '../PurgeCacheButton';

function InjectedCMEditViewCacheComponent() {
  // const {
  //   params: { model, id },
  // } = useRouteMatch('/content-manager/:kind/:model/:id?');
  // // const { isLoading, allowedActions } = useRBAC(cachePermissions);

  // const toggleNotification = useNotification();

  // const { slug } = useCMEditViewDataManager();
  // console.log('slug', slug);

  // console.log('InvalidateEntityButton prop', prop);
  // console.log('InvalidateEntityButton id', id);
  // console.log('InvalidateEntityButton model', model);
  // console.log('InvalidateEntityButton slug', slug);

  // // const { allPermissions } = useRBACProvider();
  // // const [{ isLoading, canAccess }, setState] = useState({
  // //   isLoading: true,
  // //   canAccess: false,
  // // });
  // //
  // // useEffect(() => {
  // //   const checkPermission = async () => {
  // //     try {
  // //       const canAccess = await hasPermissions(
  // //         allPermissions,
  // //         cachePermissions.readCache
  // //       );

  // //       setState({ isLoading: false, canAccess });
  // //     } catch (err) {
  // //       setState({ isLoading: false });
  // //     }
  // //   };

  // //   checkPermission();
  // // }, []);

  // // console.log({ isLoading, canAccess });

  // const [showWarningDelete, setWarningDelete] = useState(false);
  // const [isModalConfirmButtonLoading, setIsModalConfirmButtonLoading] =
  //   useState(false);
  // const { formatMessage } = useIntl();
  // // const toggleNotification = useNotification();

  // const toggleWarningDelete = () => setWarningDelete((prevState) => !prevState);

  // const handleConfirmDelete = async () => {
  //   try {
  //     // Show the loading state
  //     setIsModalConfirmButtonLoading(true);

  //     await new Promise((resolve) => setTimeout(resolve, 5000));

  //     setIsModalConfirmButtonLoading(false);

  //     toggleWarningDelete();
  //   } catch (err) {
  //     const errorMessage = get(
  //       err,
  //       'response.payload.message',
  //       formatMessage({ id: 'test' })
  //     );
  //     setIsModalConfirmButtonLoading(false);
  //     toggleWarningDelete();
  //     console.log(err);
  //     console.log(errorMessage);
  //     // toggleNotification({ type: 'warning', message: errorMessage });
  //   }
  // };

  return <PurgeCacheButton />;
}

export default InjectedCMEditViewCacheComponent;
