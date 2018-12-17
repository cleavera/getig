import { Binding } from '../decorators/binding';
import { Component } from '../decorators/component';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';

export function $componentFactory(componentDefinition: IComponentDefinition, ...args: Array<unknown>): IComponentDefinition {
    @Component({
        template: '#{content}'
    })
    class ComponentFactory {
        @Binding()
        public content: Promise<string>;

        constructor() {
            const instance: IComponentInstance = new componentDefinition(...args);

            this.content = Component.render(instance);

            Component.addInstance(this, instance);
            Component.addDynamicComponent(this, componentDefinition);
        }
    }

    return ComponentFactory;
}
