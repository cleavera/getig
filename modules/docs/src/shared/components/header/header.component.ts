import { $readFile } from '@cleavera/fs';
import { Component, Resource } from '@getig/core';
import { join } from 'path';

import { $loadStyle } from '../../helpers/load-style';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
    template: $readFile(join(__dirname, './header.component.html')),
    styles: $loadStyle(join(__dirname, './header.component.scss')),
    resources: [
        Resource.FromFilePath(join(__dirname, '../../resources/logo.png'), './logo.png')
    ],
    components: [
        NavigationComponent
    ]
})
export class HeaderComponent {}
