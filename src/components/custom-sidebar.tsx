import { useListDiagram } from '@/api/diagram';
import { Sidebar } from '@excalidraw/excalidraw';
import { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types/types';
import { FC } from 'react';

interface Props {
  handleImport: (startValues: ExcalidrawInitialDataState) => void;
}

export const CustomSidebar: FC<Props> = ({ handleImport }) => {
  const { diagrams, isLoading } = useListDiagram();

  return (
    <Sidebar dockable>
      <Sidebar.Header>
        <h1>Projects</h1>
      </Sidebar.Header>
      <div className='mx-4 my-2'>
        {isLoading ? (
          <p>Loading</p>
        ) : (
          <div className='flex flex-col items-start'>
            {diagrams?.map(diagram => (
              <button
                className='text-xl font-semibold'
                onClick={() => {
                  handleImport({
                    elements: JSON.parse(diagram.content as string),
                  });
                }}
                key={diagram.id}
              >
                {diagram.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
};
