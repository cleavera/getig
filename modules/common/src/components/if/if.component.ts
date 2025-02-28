import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { readfile } from '../../helpers/read-file';

@Component({
    template: readfile(join(__dirname, './if.component.html'))
})
export class IfComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(show: boolean, component: IComponentDefinition<T>) {
        if (!show) {
            this.content = Promise.resolve('');

            return;
        }

        COMPONENT_REGISTRY.addDynamicComponent(this, component);

        const instance: T = new component();

        COMPONENT_REGISTRY.addInstance(this, instance);

        this.content = COMPONENT_REGISTRY.render(instance);
    }
}
