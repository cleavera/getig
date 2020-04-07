import { $createDirectory, $writeFile } from '@cleavera/fs';
import { LogLevel } from '@cleavera/types';
import { join } from 'path';

import { LOGGER } from '../constants/logger.constant';
import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IResource } from '../interfaces/resource.interface';

export async function $bootstrap(module: IComponentDefinition, basePath: string = process.cwd(), logLevel: LogLevel = LogLevel.WARN): Promise<void> {
    LOGGER.configure(logLevel);

    await MODULE_REGISTRY.generate(new module(), basePath);

    await $createDirectory(join(basePath, 'resources'));

    for (const resource of RESOURCE_STORE.getResources()) {
        const { url, content }: IResource = await resource;

        await $writeFile(join(basePath, url), content);
    }
}
