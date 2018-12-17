import { IComponentDefinition } from './component-definition.interface';
import { IComponentInstance } from './component-instance.interface';

export interface IInstanceMapping {
    type: IComponentDefinition;
    instance: IComponentInstance;
}
