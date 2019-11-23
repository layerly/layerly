export type SchemaItemType = string;
export const GroupSchemaItemType: SchemaItemType = "schema/group";
export const UnknownSchemaItemType: SchemaItemType = "schema/unknown";
export const AnySchemaItemType: SchemaItemType = "schema/any";
export const RootSchemaItemType: SchemaItemType = "schema/root";

// export enum SchemaItemType {
// 	UNKNOWN,
// 	ANY,
// 	ROOT,
// 	GROUP
// 	// GRID = "grid",
// 	// ROW = "grid_row",
// 	// BLOCK = "grid_block",
// 	// SHAPE = "shape",
// 	// LIST = "list",
// 	// HEADER = "header",
// 	// INPUT = "input"
// }

export type ItemFunction<T> = (callback: BuildCallback<T>) => any;
export type BuildCallback<T> = (item: T) => void;
