import { IDict } from '@cleavera/utils';
import { Binding, Component, IComponentDefinition, IComponentInstance, IOnRender, Resource, RESOURCE_STORE } from '@getig/core';

@Component({
    template: '<link href="#{url}" rel="stylesheet">',
    isDependant: true
})
export class StylesheetComponent implements IOnRender {
    @Binding()
    public url!: string;

    public async onRender(): Promise<void> {
        const parent: IComponentInstance = Component.getParent(this);
        const components: Array<IComponentDefinition> = Component.getDescendants(parent);

        components.push(Component.getDefinition(parent));

        const styles: Resource = Resource.FromString((await this._getStyles(components)).join('\n'), 'css');

        RESOURCE_STORE.addResource(styles);

        this.url = styles.url;
    }

    private async _getStyles(components: Array<IComponentDefinition>): Promise<Array<string>> {
        const styles: IDict<boolean> = {};

        await Promise.all(components.map(async(component: IComponentDefinition) => {
            const styleDefinitions: Array<Promise<string>> = Component.getStyles(component);

            for (const styleDefinition of styleDefinitions) {
                styles[(await styleDefinition)] = true;
            }
        }));

        return Object.keys(styles);
    }
}
