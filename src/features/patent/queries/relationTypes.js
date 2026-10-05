import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export const relationTypeKeys = {
    all: ['relationTypes'],
    list: () => [...relationTypeKeys.all, 'list'],
};

export const useRelationTypes = () => {
    return useQuery({
        queryKey: relationTypeKeys.list(),
        queryFn: () =>
            api.get('/patient-relation-types').then((r) => {
                const body = r.data.data || r.data;
                return Array.isArray(body) ? body : body?.data || [];
            }),
        staleTime: 1000 * 60 * 60, // 1 hour — rarely changes
    });
};