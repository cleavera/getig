import { Asyncable } from '@cleavera/utils';

export interface IBeforeGenerate {
    beforeGenerate(): Asyncable<void>;
}
