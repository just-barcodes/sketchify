import { type SketchParams } from '../sketch/types.ts';

/** The tunable controls that "Reset controls" restores (paper colour is kept). */
const RESET_PARAMS: Pick<
  SketchParams,
  'type' | 'background' | 'intensity' | 'contrast' | 'brightness' | 'detail'
> = {
  type: 'graphite',
  background: 'white',
  intensity: 70,
  contrast: 26,
  brightness: 38,
  detail: 62,
};

export type SketchAction = { type: 'patch'; patch: Partial<SketchParams> } | { type: 'reset' };

export function sketchReducer(state: SketchParams, action: SketchAction): SketchParams {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch };
    case 'reset':
      // Keep the chosen custom paper colour; restore everything else.
      return { ...state, ...RESET_PARAMS };
  }
}
