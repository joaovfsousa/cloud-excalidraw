import { useCreateDiagram } from '@/api/diagram';
import { Excalidraw } from '@excalidraw/excalidraw';
import {
  ExcalidrawAPIRefValue,
  LibraryItemsSource,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';

const DIAGRAM_KEY = 'excalidraw';
const LIBRARY_KEY = 'excalidrawLibrary';

export const Board: FC<{ theme: string }> = ({ theme }) => {
  const qs = decodeURIComponent(document.location.hash);
  const qsRegex = /addLibrary=(?<addLibrary>[^&]*)/;
  const parsedQs = qs.match(qsRegex);
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
      localStorage.setItem(DIAGRAM_KEY, JSON.stringify(toSave));
    }
  };

  const getStartValues = (): ExcalidrawInitialDataState => {
    const values: ExcalidrawInitialDataState = {
      elements: [],
      libraryItems: [],
    };

    const savedDrawString = localStorage.getItem(DIAGRAM_KEY);
    const savedLibraryString = localStorage.getItem(LIBRARY_KEY);

    if (savedDrawString) {
      values.elements = JSON.parse(savedDrawString);
    }

    if (savedLibraryString) {
      values.libraryItems = JSON.parse(savedLibraryString);
    }

    return values;
  };

  const handleImport = async () => {
    const api = await getApi();
    const startValues = getStartValues();

    if (api && startValues) {
      api.updateScene({ elements: startValues.elements });
    }
  };

  const persistLibrary = (libraryItems: LibraryItemsSource) => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryItems));
  };

  const handleAddLibrary = async (libraryItems: LibraryItemsSource) => {
    const api = await getApi();
    if (api) {
      api.updateLibrary({
        libraryItems,
        merge: true,
        openLibraryMenu: true,
      });
    }
  };

  useEffect(() => {
    (async () => {
      if (!excalidrawAPI?.ready) {
        return;
      }

      if (!parsedQs) {
        return;
      }

      const addLibraryUrl = parsedQs.groups?.addLibrary;

      if (addLibraryUrl) {
        const lib = await axios.get<{ libraryItems: LibraryItemsSource }>(
          addLibraryUrl
        );
        handleAddLibrary(lib.data.libraryItems);
      }
    })();
  }, [excalidrawAPI?.ready]);

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
          onLibraryChange={persistLibrary}
        />
      }
    </>
  );
};
