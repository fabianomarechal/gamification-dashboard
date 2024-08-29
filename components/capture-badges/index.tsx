'use client';
import { handleScreenshots } from 'app/dashboard/actions';
import { useEffect, useState } from 'react';
import { GoogleButton, ScreenShotButton } from '../ui/button';
import ProgressBar from '../ui/progress-bar';

export function CaptureBadges () {
  const [ counter, setCounter ] = useState(-1);
  const [state, setState] = useState({ current: 0, total: 0, status: '' });


  useEffect(() => {
    console.log('state', state);
    setCounter(state.current);
  }, [state.current, state.total]);

  useEffect(() => {
    console.log('counter', counter);
    if(counter !== -1) {
      handleScreenshots(counter);
    }
  }, [counter]);

  const handleStart = () => {
    handleScreenshots(counter).then(data => {
      console.log('data1', data);
      setState(data);
    }).catch(error => {
      console.error('error', error);
    });
  }

  return (
    <form onClick={handleStart}>
      <div className="flex mb-12 items-center">
        <div className="ml-auto flex items-center gap-2">
          <GoogleButton />
          <ScreenShotButton />
        </div>
      </div>
      <div className="flex gap-4 mt-16">
        <ProgressBar status={'Copiando dados'} total={state.total} current={state.current} />
      </div>
    </form>
  );
}