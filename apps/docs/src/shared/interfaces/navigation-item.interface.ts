import { IAction } from './action.interface';

export interface INavigationItem {
    action: IAction;
    children?: Array<INavigationItem>;
}
