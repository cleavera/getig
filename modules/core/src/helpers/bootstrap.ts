import { $createDirectory, $writeFile } from '@cleavera/fs';
import { join } from 'path';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { Module } from '../decorators/module';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IResource } from '../interfaces/resource.interface';

export async function $bootstrap(module: IComponentDefinition, basePath: string = process.cwd()): Promise<void> {
    await Module.generate(new module(), basePath);

    await $createDirectory(join(basePath, 'resources'));

    for (const resource of RESOURCE_STORE.getResources()) {
        const { url, content }: IResource = await resource;

        await $writeFile(join(basePath, url), content);
    }
}
