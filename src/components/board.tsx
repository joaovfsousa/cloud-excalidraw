import { useCreateDiagram } from '@/api/diagram';
import { Excalidraw } from '@excalidraw/excalidraw';
import {
  ExcalidrawAPIRefValue,
  LibraryItemsSource,
  ExcalidrawInitialDataState,
  AppState,
} from '@excalidraw/excalidraw/types/types';
import axios from 'axios';
import { FC, useCallback, useEffect, useState } from 'react';
import { CustomSidebar } from './custom-sidebar';

const DIAGRAM_KEY = 'excalidraw';
const LIBRARY_KEY = 'excalidrawLibrary';
const STATE_KEY = 'excalidrawState';

export const Board: FC<{ theme: string }> = ({ theme }) => {
  const qs = decodeURIComponent(document.location.hash);
  const qsRegex = /addLibrary=(?<addLibrary>[^&]*)/;
  const parsedQs = qs.match(qsRegex);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawAPIRefValue | null>(null);

  const { trigger, isMutating } = useCreateDiagram();

  const getApi = useCallback(async () => {
    return excalidrawAPI?.readyPromise && (await excalidrawAPI.readyPromise);
  }, [excalidrawAPI]);

  const handleExport = async () => {
    const api = await getApi();
    if (api) {
      const toSave = api.getSceneElements();

      await trigger({ content: JSON.stringify(toSave), name: 'Test' });
    }
  };

  const getStartValues = (): ExcalidrawInitialDataState => {
    const values: ExcalidrawInitialDataState = {
      elements: [],
      libraryItems: [],
      appState: undefined,
    };

    const savedDrawString = localStorage.getItem(DIAGRAM_KEY);
    const savedLibraryString = localStorage.getItem(LIBRARY_KEY);
    const savedAppState = localStorage.getItem(STATE_KEY);

    if (savedDrawString) {
      values.elements = JSON.parse(savedDrawString);
    }

    if (savedLibraryString) {
      values.libraryItems = JSON.parse(savedLibraryString);
    }

    if (savedAppState) {
      const appState: AppState = JSON.parse(savedAppState);
      values.appState = {
        isSidebarDocked: appState.isSidebarDocked,
        openSidebar: appState.openSidebar,
        activeTool: appState.activeTool,
        exportWithDarkMode: appState.exportWithDarkMode,
        theme: appState.theme,
      };
    }

    return values;
  };

  const handleImport = async (startValues: ExcalidrawInitialDataState) => {
    const api = await getApi();

    startValues = startValues ?? getStartValues();

    if (api && startValues) {
      api.updateScene({ elements: startValues.elements });
    }
  };

  const toggleSidebar = async () => {
    const api = await getApi();

    if (api) {
      api.toggleMenu('customSidebar');
    }
  };

  const persistLibrary = (libraryItems: LibraryItemsSource) => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryItems));
  };

  const persistState = (_: unknown, appState: AppState) => {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
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

      if (addLibraryUrl) {
        const lib = await axios.get<{ libraryItems: LibraryItemsSource }>(
          addLibraryUrl
        );
        handleAddLibrary(lib.data.libraryItems);
      }
    })();
  }, [excalidrawAPI?.ready, parsedQs, getApi]);

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
              <button onClick={toggleSidebar}>Open Sidebar</button>
            </>
          )}
          onLibraryChange={persistLibrary}
          onChange={persistState}
          renderSidebar={() => <CustomSidebar handleImport={handleImport} />}
        />
      }
    </>
  );
};
