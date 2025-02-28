import { compileAsync } from 'sass';

export async function $loadStyle(path: string): Promise<string> {
    return (await compileAsync(path)).css;
}
