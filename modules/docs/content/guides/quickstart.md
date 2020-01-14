# Quickstart guide

```typescript
import { $bootstrap, Module, Page, Resource } from '@getig/core';
import { $componentFactory, StylesheetComponent } from '@getig/common';
import { join, resolve } from 'path';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { MarkdownComponent } from '../../../shared';

@Component({
    template: `
        <!DOCTYPE HTML>
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            @{StylesheetComponent()}
            <title>Getig example</title>
        </head>
        <body>
            <h1>Getig example</h1
            
            <p>This is an example page</p>
        </body>
        </html>`,
    styles: `
        h1 {
            color: red;
        }
    `,
    components: [
        StylesheetComponent
    ]
})
export class HomeComponent {
    @Binding()
    public contentComponent: IComponentDefinition;

    constructor() {
        this.contentComponent = $componentFactory(MarkdownComponent, 'index.md');
    }
}

@Module({
    path: '/',
    pages: [
        Page.Create('index.html', new HomeComponent())
    ],
    children: [],
    resources: [
        Resource.FromFilePath(join(__dirname, './resources/favicon.ico'), './favicon.ico')
    ]
})
export class CoreModule {}

$bootstrap(CoreModule, resolve('../dist')).catch((e: Error) => {
    throw e;
});
```
