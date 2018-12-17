import { Asyncable } from '@cleavera/utils';
import { OneOrMany } from '@cleavera/utils/dist';
import { IComponentDefinition } from './component-definition.interface';

export interface IComponentDescription {
    template: Asyncable<string>;
    styles?: OneOrMany<Asyncable<string>>;
    scripts?: OneOrMany<Asyncable<string>>;
    components?: Array<IComponentDefinition>;
}
