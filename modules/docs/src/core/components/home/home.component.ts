import { $readFile } from '@cleavera/fs';
import { $componentFactory } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { LayoutComponent, MarkdownComponent } from '../../../shared';

@Component({
    template: $readFile(join(__dirname, './home.component.html')),
    components: [
        LayoutComponent
    ]
})
export class HomeComponent {
    @Binding()
    public contentComponent: IComponentDefinition;

    constructor() {
        this.contentComponent = $componentFactory(MarkdownComponent, 'index.md');
    }
}