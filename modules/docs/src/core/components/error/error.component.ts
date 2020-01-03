import { $readFile } from '@cleavera/fs';
import { $componentFactory, DynamicComponent } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { MarkdownComponent } from '../../../shared';

@Component({
    template: $readFile(join(__dirname, './error.component.html')),
    components: [
        DynamicComponent
    ]
})
export class ErrorComponent {
    @Binding()
    public content: IComponentDefinition;

    constructor() {
        this.content = $componentFactory(MarkdownComponent, 'error.md');
    }
}
