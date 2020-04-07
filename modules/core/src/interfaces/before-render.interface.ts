import { Asyncable } from '@cleavera/types';

export interface IBeforeRender {
    beforeRender(): Asyncable<void>;
}
