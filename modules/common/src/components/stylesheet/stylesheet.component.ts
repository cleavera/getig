import { IDict } from '@cleavera/utils';
import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition, IComponentInstance, IOnRender, Resource, RESOURCE_STORE } from '@getig/core';

@Component({
    template: '<link href="#{url}" rel="stylesheet">',
    isDependant: true
})
export class StylesheetComponent implements IOnRender {
    @Binding()
    public url!: string;

    public async onRender(): Promise<void> {
        const parent: IComponentInstance = COMPONENT_REGISTRY.getParent(this);
        const components: Array<IComponentDefinition> = COMPONENT_REGISTRY.getDescendants(parent);

        components.push(COMPONENT_REGISTRY.getDefinition(parent));

        const styles: Resource = Resource.FromString((await this._getStyles(components)).join('\n'), 'css');

        RESOURCE_STORE.addResource(styles);

        this.url = styles.url;
    }

    private async _getStyles(components: Array<IComponentDefinition>): Promise<Array<string>> {
        const styles: IDict<boolean> = {};

        await Promise.all(components.map(async(component: IComponentDefinition) => {
            const styleDefinitions: Array<Promise<string>> = COMPONENT_REGISTRY.getStyles(component);

            for (const styleDefinition of styleDefinitions) {
                styles[(await styleDefinition)] = true;
            }
        }));

        return Object.keys(styles);
    }
}
