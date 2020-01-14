export function $getFilename(filePath: string): string {
    return filePath.substring(filePath.replace('\\', '/').lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
}
