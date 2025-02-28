export class MetaData<T extends object> {
    private readonly _META_PROPERTY_NAME: symbol;

    constructor(description = 'MetaData') {
        this._META_PROPERTY_NAME = Symbol(description);
    }

    public get<TKey extends keyof T>(object: object, metaKey: TKey): T[TKey] | null {
        return (object as Record<symbol, Partial<T> | null>)[this._META_PROPERTY_NAME]?.[metaKey] ?? null;
    }

    public set<TKey extends keyof T>(object: object, metaKey: TKey, value: T[TKey]): void {
        if (!(this._META_PROPERTY_NAME in object)) {
            (object as Record<symbol, Partial<T>>)[this._META_PROPERTY_NAME] = {};
        }

        (object as Record<symbol, Partial<T>>)[this._META_PROPERTY_NAME][metaKey] = value;
    }
}
