'use client';
import { handleScreenshots } from 'app/dashboard/actions';
import { StatusEnum } from 'app/dashboard/enums/status.enum';
import { useCallback, useEffect, useState } from 'react';
import { GoogleButton, ScreenShotButton } from '../ui/button';
import ProgressBar from '../ui/progress-bar';

interface CaptureBadgesProps {
  current: number,
  total: number,
  folderId?: string,
  status: string,
  message?: string
} 

export function CaptureBadges () {
  const [state, setState] = useState<CaptureBadgesProps>({
    current: 0,
    total: 0,
    status: StatusEnum.NOT_STARTED,
    folderId: undefined
  });

  const updateState = useCallback(async () => {
    if(state.total === 0 || state.current >= state.total) return;

    try {
      const data = await handleScreenshots(state.current, state.total, state.folderId)
      setState(data);
    } catch(error) {
      console.error('Error updating state:', error);
    };
  }, [state]);

  useEffect(() => {
    updateState();
  }, [updateState]);

  const handleStart = useCallback(async () => {
    try {
      const data = await handleScreenshots(-1, state.total, state.folderId);
      setState(data);
    } catch (error) {
      console.error('Error starting process:', error);
    }
  }, [state.total, state.folderId]);

  return (
    <form onClick={handleStart}>
      <div className="flex mb-12 items-center">
        <div className="ml-auto flex items-center gap-2">
          <GoogleButton />
          <ScreenShotButton />
        </div>
      </div>
      <div className="flex gap-4 mt-16">
        <ProgressBar status={state.status} total={state.total} current={state.current} message={state.message} />
      </div>
    </form>
  );
}