import { Asyncable } from '@cleavera/types';

import { IModuleDefinition } from './module-definition.interface';
import { IPage } from './page.interface';
import { IResource } from './resource.interface';

export interface IModuleDescription {
    path: string;
    children?: Array<IModuleDefinition>;
    pages?: Array<IPage>;
    resources?: Array<Asyncable<IResource>>;
}
