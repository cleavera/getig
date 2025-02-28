import { IComponentDefinition } from './component-definition.interface';

export type IComponentInstance = object & {
  constructor: IComponentDefinition;
  onRender?: () => void | Promise<void>;
  beforeRender?: () => void | Promise<void>;
};
