import { IComponentDefinition } from './component-definition.interface';
import { IResource } from './resource.interface';

export interface IComponentDescription {
    template: string | Promise<string>;
    styles?: string | Promise<string> | Array<string | Promise<string>>;
    scripts?: string | Promise<string> | Array<string | Promise<string>>;
    resources?: IResource | Promise<IResource> | Array<IResource | Promise<IResource>>;
    components?: Array<IComponentDefinition>;
    isDependant?: boolean;
}
