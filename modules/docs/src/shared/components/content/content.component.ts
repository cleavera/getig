import { $readFile } from '@cleavera/fs';
import { DynamicComponent, IfComponent } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { $loadStyle } from '../../helpers/load-style';
import { HeaderComponent } from '../header/header.component';

@Component({
    template: $readFile(join(__dirname, './content.component.html')),
    styles: $loadStyle(join(__dirname, './content.component.scss')),
    components: [
        DynamicComponent,
        IfComponent,
        HeaderComponent
    ]
})
export class ContentComponent {
    @Binding()
    public content: IComponentDefinition;

    constructor(contentComponent: IComponentDefinition) {
        this.content = contentComponent;
    }
}
