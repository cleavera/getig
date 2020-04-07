import { Asyncable } from '@cleavera/types';

export interface IBeforeGenerate {
    beforeGenerate(): Asyncable<void>;
}
