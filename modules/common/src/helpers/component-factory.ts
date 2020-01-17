import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition, IComponentInstance } from '@getig/core';

export function $componentFactory(componentDefinition: IComponentDefinition, ...args: Array<unknown>): IComponentDefinition {
    @Component({
        template: '#{content}'
    })
    class ComponentFactory {
        @Binding()
        public content: Promise<string>;

        constructor() {
            const instance: IComponentInstance = new componentDefinition(...args);

            this.content = COMPONENT_REGISTRY.render(instance);

            COMPONENT_REGISTRY.addInstance(this, instance);
            COMPONENT_REGISTRY.addDynamicComponent(this, componentDefinition);
        }
    }

    return ComponentFactory;
}
