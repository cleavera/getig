import { Asyncable, OneOrMany } from '@cleavera/types';
import { IComponentDefinition } from './component-definition.interface';
import { IResource } from './resource.interface';

export interface IComponentDescription {
    template: Asyncable<string>;
    styles?: OneOrMany<Asyncable<string>>;
    scripts?: OneOrMany<Asyncable<string>>;
    resources?: OneOrMany<Asyncable<IResource>>;
    components?: Array<IComponentDefinition>;
    isDependant?: boolean;
}
