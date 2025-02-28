import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentDescription } from '../interfaces/component-description.interface';

export function Component(componentDescription: IComponentDescription): ClassDecorator {
    return (componentDefinition: object): void => {
        COMPONENT_REGISTRY.register(componentDescription, componentDefinition as IComponentDefinition);
    };
}
