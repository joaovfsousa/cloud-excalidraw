'use client';
import dynamic from 'next/dynamic';

const Board = dynamic(async () => (await import('@/board')).Board, {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex w-full h-screen">
      <Board theme={'dark'} />
    </div>
  )
}
