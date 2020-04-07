import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { IComponentDescription } from '../interfaces/component-description.interface';

export function Component(componentDescription: IComponentDescription): ClassDecorator {
    return (componentDefinition: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        COMPONENT_REGISTRY.register(componentDescription, componentDefinition);
    };
}
