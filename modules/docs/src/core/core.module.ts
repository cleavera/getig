import { Module, Page, Resource } from '@getig/core';
import { join } from 'path';
import { PageComponent } from '../shared';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';

@Module({
    path: '/',
    pages: [
        Page.Create('index.html', new PageComponent('People first style guide', HomeComponent)),
        Page.Create('error.html', new PageComponent('Ooops', ErrorComponent))
    ],
    children: [],
    resources: [
        Resource.FromFilePath(join(__dirname, './resources/favicon.ico'), './favicon.ico')
    ]
})
export class CoreModule {
}
