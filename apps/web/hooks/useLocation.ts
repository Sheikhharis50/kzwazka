import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { ILocation } from 'api/type';

export function useLocation() {
  const getAllLocations = useQuery({
    queryKey: ['locations'],
    queryFn: async () => await api.location.getAll(),
  });

  const locationOptions =
    getAllLocations.data?.data?.map((location: ILocation) => ({
      value: location?.id,
      label: [location?.address1, location?.address2, location?.city]
        .filter(Boolean)
        .join(', '),
    })) || [];

  return { getAllLocations, locationOptions };
}
