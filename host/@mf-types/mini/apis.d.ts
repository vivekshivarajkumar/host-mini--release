
    export type RemoteKeys = 'mini/App';
    type PackageType<T> = T extends 'mini/App' ? typeof import('mini/App') :any;