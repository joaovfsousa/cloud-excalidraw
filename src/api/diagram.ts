import useSWRMutation from 'swr/mutation';

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
