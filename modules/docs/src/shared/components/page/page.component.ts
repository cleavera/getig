import { $readFile } from '@cleavera/fs';
import { DynamicComponent, ScriptsComponent, StylesheetComponent } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { $loadStyle } from '../../helpers/load-style';

@Component({
    template: $readFile(join(__dirname, './page.component.html')),
    styles: $loadStyle(join(__dirname, './page.component.scss')),
    components: [
        StylesheetComponent,
        ScriptsComponent,
        DynamicComponent
    ]
})
export class PageComponent {
    @Binding()
    public title: string;

    @Binding()
    public contentComponent: IComponentDefinition;

    constructor(title: string, componentDefinition: IComponentDefinition) {
        this.title = title;

        this.contentComponent = componentDefinition;
    }
}
