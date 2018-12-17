import { IResource } from '../interfaces/resource.interface';
import { IComponentInstance } from './component-instance.interface';

export interface IPage {
    fileName: string;
    component: IComponentInstance;
    resources: Array<Promise<IResource>>;
}
