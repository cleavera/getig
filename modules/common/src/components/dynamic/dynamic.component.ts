import { $readFile } from '@cleavera/fs';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';

@Component({
    template: $readFile(join(__dirname, './dynamic.component.html'))
})
export class DynamicComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(component: IComponentDefinition<T>) {
        Component.addDynamicComponent(this, component);

        const instance: T = new component();

        Component.addInstance(this, instance);

        this.content = Component.render(instance);
    }
}
