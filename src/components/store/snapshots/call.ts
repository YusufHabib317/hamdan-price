import { ApiClient } from '@/libs';
import { apiEndpoints } from '@/data/api-endpoints';
import { handleApiError } from '@/utils/api-utils/handle-backend-error';
import {
  CreateSnapshotApiRequest,
  PricingSnapshot,
  SnapshotsListResponse,
  GetSnapshotsQueryProps,
  GetSnapshotQueryProps,
} from './types';

enum queryKeys {
  snapshots = 'snapshots',
  snapshot = 'snapshot',
  createSnapshot = 'createSnapshot',
}

// GET all snapshots request
const getSnapshotsRequest = (props: GetSnapshotsQueryProps) => {
  const { pagination } = props;
  return ApiClient.get<SnapshotsListResponse>(apiEndpoints.snapshots(), {
    params: {
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    },
  })
    .then((res) => res.data)
    .catch((err) => {
      handleApiError(err);
      throw err;
    });
};

export const getSnapshotsQuery = (props: GetSnapshotsQueryProps = {}) => ({
  queryKey: [queryKeys.snapshots, props?.pagination?.page],
  queryFn: () => getSnapshotsRequest(props),
  refetchOnWindowFocus: false,
});

// GET single snapshot request
const getSnapshotRequest = (props: GetSnapshotQueryProps) => {
  const { id } = props;
  return ApiClient.get<PricingSnapshot>(apiEndpoints.snapshot(id))
    .then((res) => res.data)
    .catch((err) => {
      handleApiError(err);
      throw err;
    });
};

export const getSnapshotQuery = (props: GetSnapshotQueryProps) => ({
  queryKey: [queryKeys.snapshot, props.id],
  queryFn: () => getSnapshotRequest(props),
  refetchOnWindowFocus: false,
  enabled: !!props.id,
});

// POST create snapshot request
const createSnapshotRequest = ({ body }: { body: CreateSnapshotApiRequest }) => ApiClient.post<PricingSnapshot>(apiEndpoints.snapshots(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });

export const createSnapshotMutation = () => ({
  mutationKey: [queryKeys.createSnapshot],
  mutationFn: ({ body }: { body: CreateSnapshotApiRequest }) => createSnapshotRequest({ body }),
});
