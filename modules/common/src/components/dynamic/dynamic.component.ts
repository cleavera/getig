import { $readFile } from '@cleavera/fs';
import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition } from '@getig/core';
import { join } from 'path';

@Component({
    template: $readFile(join(__dirname, './dynamic.component.html'))
})
export class DynamicComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(component: IComponentDefinition<T>) {
        COMPONENT_REGISTRY.addDynamicComponent(this, component);

        const instance: T = new component();

        COMPONENT_REGISTRY.addInstance(this, instance);

        this.content = COMPONENT_REGISTRY.render(instance);
    }
}
