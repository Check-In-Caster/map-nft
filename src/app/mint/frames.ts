import { createFrames } from 'frames.js/next';

export type State = {
  first?: boolean;
  properties?: Property[];
  current?: number;
};

type Property = {
  property_id: string | null;
};

export const frames = createFrames<State>({
  basePath: '/mint',
});
