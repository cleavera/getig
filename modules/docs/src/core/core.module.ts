import { Module, Page, Resource } from '@getig/core';
import { join } from 'path';
import { DocsModule } from '../docs';
import { GuidesModule } from '../guides';
import { PageComponent } from '../shared';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';

@Module({
    path: '/',
    pages: [
        Page.Create('index.html', new PageComponent('Getig documentation', HomeComponent)),
        Page.Create('error.html', new PageComponent('Ooops', ErrorComponent))
    ],
    children: [
        DocsModule,
        GuidesModule
    ],
    resources: [
        Resource.FromFilePath(join(__dirname, './resources/favicon.ico'), './favicon.ico')
    ]
})
export class CoreModule {}
