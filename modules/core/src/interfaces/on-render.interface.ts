import { Asyncable } from '@cleavera/utils';

export interface IOnRender {
    onRender(): Asyncable<void>;
}
