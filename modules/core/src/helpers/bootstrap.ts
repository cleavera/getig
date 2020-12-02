import { $writeFile } from '@cleavera/fs';
import { LogLevel } from '@cleavera/types';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { LOGGER } from '../constants/logger.constant';
import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IResource } from '../interfaces/resource.interface';

export async function $bootstrap(module: IComponentDefinition, basePath: string = process.cwd(), logLevel: LogLevel = LogLevel.WARN): Promise<void> {
    LOGGER.configure(logLevel);

    await MODULE_REGISTRY.generate(new module(), basePath);

    for (const resource of RESOURCE_STORE.getResources()) {
        const { url, content }: IResource = await resource;
        const path: string = join(basePath, url);
        const directory: string = dirname(path);

        try {
            await fs.access(directory);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(directory, {
                    recursive: true
                });
            } else {
                throw error;
            }
        }

        await $writeFile(join(basePath, url), content);
    }
}
