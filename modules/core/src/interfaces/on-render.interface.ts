import { Asyncable } from '@cleavera/types';

export interface IOnRender {
    onRender(): Asyncable<void>;
}
