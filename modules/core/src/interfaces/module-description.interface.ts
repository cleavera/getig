import { Asyncable } from '@cleavera/utils';
import { IComponentDefinition } from './component-definition.interface';
import { IPage } from './page.interface';
import { IResource } from './resource.interface';

export interface IModuleDescription {
    path: string;
    children?: Array<IComponentDefinition>;
    pages?: Array<IPage>;
    resources?: Array<Asyncable<IResource>>;
}
