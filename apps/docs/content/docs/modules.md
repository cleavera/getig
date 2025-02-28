# Modules

Modules are the large building blocks of getig sites. Every site must contain at least one and they can be nested as deep as needed. They are a way of separating and namespacing areas of your site, they will essentially create folders in the generated site. When you compile your site, its a module that you pass in as a starting point. Lets break down at an example module declaration.

```typescript
import { IBeforeGenerate, Module, Page, Resource } from '@getig/core';
import { join } from 'path';
import { DocsModule } from '../docs';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';

@Module({
    path: '/', // 1. Path
    pages: [ // 2. Pages
        Page.Create('index.html', new HomeComponent()),
        Page.Create('error.html', new ErrorComponent())
    ],
    children: [
        DocsModule
    ], // 3. Children
    resources: [ // 4. Resources
        Resource.FromFilePath(join(__dirname, './resources/favicon.ico'), './favicon.ico')
    ]
})
export class CoreModule implements IBeforeGenerate {
    public beforeGenerate(): void { // 5. Before generate
        console.log('Generating');
    }
}
```

## 1. Path

The path to use as the namespace, the name to use for the folder to create for the module.

## 2. Pages

An array of [pages](./pages.html) to include in this module.

## 3. Children

An array of child modules to nest under this module.

## 4. Resources

A list of static resources to include into the module, these can be things like your favicon or a robots.txt.

## 5. Before generate

Some code to run before generating the module, this is useful if you want to run some code after components and pages have registered their meta data but before any code has been generated.
