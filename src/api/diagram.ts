import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';
import { Diagram } from '@prisma/client';

async function createDiagram(
  url: string,
  { arg: body }: { arg: Record<string, unknown> }
) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(res => res.json());
}

export function useCreateDiagram() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    '/api/diagrams',
    createDiagram,
    {}
  );

  return {
    trigger,
    diagram: data,
    isMutating,
    isError: error,
  };
}

async function listDiagrams(url: string) {
  return fetch(url, {
    method: 'GET',
  }).then(res => res.json());
}

export function useListDiagram() {
  const { data, error, isLoading } = useSWR<Diagram[]>(
    '/api/diagrams',
    listDiagrams,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    diagrams: data,
    isError: error,
    isLoading,
  };
}
