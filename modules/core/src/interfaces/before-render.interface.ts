import { Asyncable } from '@cleavera/utils';

export interface IBeforeRender {
    beforeRender(): Asyncable<void>;
}
