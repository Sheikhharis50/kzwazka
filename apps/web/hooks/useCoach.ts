import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { ICoach } from 'api/type';

export function useCoach() {
  const getAllCoaches = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => await api.coach.getAll(),
  });

  const coachOptions =
    getAllCoaches.data?.data?.map((coach: ICoach) => ({
      value: coach?.id,
      label: `${coach?.user?.first_name} ${coach?.user?.last_name}`,
    })) || [];

  return { getAllCoaches, coachOptions };
}
