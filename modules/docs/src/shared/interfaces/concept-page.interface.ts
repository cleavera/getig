import { IResource } from '@getig/core';

export interface IConceptPage {
    path: string;
    title: string;
    content: string;
    resources: Array<IResource>;
}
