export const apiEndpoints = {
  // Snapshots
  snapshots: () => '/snapshots',
  snapshot: (id: string) => `/snapshots/${id}`,
} as const;
