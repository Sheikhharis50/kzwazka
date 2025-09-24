import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { GetCoachQueryParams, ICoach } from 'api/type';

export function useCoach(queryParams: GetCoachQueryParams = {}) {
  const getAllCoaches = useQuery({
    queryKey: ['coaches', queryParams],
    queryFn: async () => await api.coach.getAll(queryParams),
  });

  const coachOptions =
    getAllCoaches?.data?.data?.map((coach: ICoach) => ({
      value: coach?.id,
      label: `${coach?.user?.first_name} ${coach?.user?.last_name}`,
    })) || [];

  return { getAllCoaches, coachOptions };
}
