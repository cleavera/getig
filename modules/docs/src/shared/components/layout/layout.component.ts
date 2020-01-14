import { $readFile } from '@cleavera/fs';
import { DynamicComponent, IfComponent } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { $loadStyle } from '../../helpers/load-style';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
    template: $readFile(join(__dirname, './layout.component.html')),
    styles: $loadStyle(join(__dirname, './layout.component.scss')),
    components: [
        DynamicComponent,
        IfComponent,
        NavigationComponent,
        HeaderComponent
    ]
})
export class LayoutComponent {
    @Binding()
    public content: IComponentDefinition;

    constructor(contentComponent: IComponentDefinition) {
        this.content = contentComponent;
    }
}
