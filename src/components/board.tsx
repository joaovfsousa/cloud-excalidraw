import { useCreateDiagram } from '@/api/diagram';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types';
import { FC, useState } from 'react';

export const Board: FC<{ theme: string }> = ({ theme }) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawAPIRefValue | null>(null);

  const { trigger, isMutating } = useCreateDiagram();

  const getApi = async () => {
    return excalidrawAPI?.readyPromise && (await excalidrawAPI.readyPromise);
  };

  const handleExport = async () => {
    const api = await getApi();
    if (api) {
      const toSave = api.getSceneElements();

      await trigger({ content: JSON.stringify(toSave), name: 'Test' });
      localStorage.setItem('excalidraw', JSON.stringify(toSave));
    }
  };

  const getStartValues = () => {
    const savedString = localStorage.getItem('excalidraw');
    if (savedString) {
      return { elements: JSON.parse(savedString) };
    }
    return null;
  };

  const handleImport = async () => {
    const api = await getApi();
    const startValues = getStartValues();

    if (api && startValues) {
      api.updateScene(startValues);
    }
  };

  return (
    <>
      {isMutating && <h1>Saving diagram</h1>}
      {
        <Excalidraw
          initialData={getStartValues()}
          theme={theme}
          ref={api => setExcalidrawAPI(api)}
          renderTopRightUI={() => (
            <>
              <button onClick={handleImport}>Import</button>
              <button onClick={handleExport}>Export</button>
            </>
          )}
        />
      }
    </>
  );
};
