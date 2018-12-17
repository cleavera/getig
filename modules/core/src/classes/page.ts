import { Asyncable } from '@cleavera/utils';
import { IComponentInstance } from '../interfaces/component-instance.interface';
import { IPage } from '../interfaces/page.interface';
import { IResource } from '../interfaces/resource.interface';

export class Page implements IPage {
    public fileName: string;
    public component: IComponentInstance;
    public resources: Array<Promise<IResource>>;

    private constructor(fileName: string, component: IComponentInstance, resources: Array<Promise<IResource>>) {
        this.fileName = fileName;
        this.component = component;
        this.resources = resources;
    }

    public static Create(fileName: string, component: IComponentInstance, resources: Array<Asyncable<IResource>> = []): Page {
        return new Page(fileName, component, resources.map((resource: Asyncable<IResource>): Promise<IResource> => {
            return Promise.resolve(resource);
        }));
    }
}
