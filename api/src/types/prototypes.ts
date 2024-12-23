export namespace Types {
    export type IMLString =
        | string
        | {
              default: string;
              values: [string, string][];
          };
    export class MLString extends String {
        private _map?: Map<string, string> = new Map<string, string>();
        constructor();
        constructor(str: string);
        constructor(mlString: IMLString);
        constructor(...arg: any[]) {
            super(arg.length === 0 ? '' : typeof arg[0] === 'object' ? arg[0].default : arg[0]);
            switch (arg.length) {
                case 0:
                    return;
                case 1:
                    if (typeof arg[0] === 'object') {
                        this._map = new Map<string, string>(arg[0].map);
                    }
            }
        }
        toString(): string;
        toString(lang: string): string;
        toString(...arg: any[]): string | undefined {
            switch (arg.length) {
                case 0:
                    return super.toString();
                default:
                    return this._map?.has(arg[0]) ? (this._map.get(arg[0]) as string) : super.toString();
            }
        }
        get json(): IMLString {
            return this._map === undefined
                ? this.toString()
                : {
                      default: this.toString(),
                      values: Array.from(this._map),
                  };
        }
    }
    export type ObjectId = number;
}
export enum DocumentErrorCode {
    unknown,
    abstract_method,
    sql_connection_error,
    sql_not_found,
    parameter_expected,
    wf_suspense,
    redundant_value,
}
export enum WorkflowStatusCode {
    draft,
    registered,
    approved,
    processing,
    done,
    review,
    closed,
}
export interface IDocument {
    id?: Types.ObjectId;
    locked?: boolean;
    lockedByUser?: string;
    blocked?: boolean;
    created?: Date;
    changed?: Date;
    createdByUser?: string;
    changedByUser?: string;
    wfStatus?: WorkflowStatusCode;
}
