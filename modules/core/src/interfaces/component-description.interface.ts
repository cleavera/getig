import { Asyncable, OneOrMany } from '@cleavera/utils';
import { IComponentDefinition } from './component-definition.interface';

export interface IComponentDescription {
    template: Asyncable<string>;
    styles?: OneOrMany<Asyncable<string>>;
    scripts?: OneOrMany<Asyncable<string>>;
    components?: Array<IComponentDefinition>;
    isDependant?: boolean;
}
