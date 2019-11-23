import { cloneDeep } from "lodash";
import hash from "object-hash";
import { isSchemaItem, SchemaItem } from "./SchemaItem";
import { BuildCallback } from "./types";

class Schema {
	public name?: string;
	public guid: string;

	protected internal: SchemaItem[];

	public constructor(schemaName?: string) {
		this.name = schemaName;
		this.internal = [];
	}

	protected createSubInstance<T extends { new (...args: any[]) }>(
		clazz: T,
		opts?: any
	): InstanceType<T> {
		const subInstance = new clazz({ options: opts });
		this.internal.push(subInstance);
		return subInstance;
	}

	protected chain<T extends SchemaItem>(
		buildCallback: BuildCallback<T>,
		clazz: new (...args: any[]) => T
	) {
		const item = this.createSubInstance(clazz);
		if (typeof buildCallback === "function") {
			buildCallback(item);
		}
		return item;
	}

	public hash() {
		this.guid = hash(this);
		return this.guid;
	}

	public getInternal() {
		return this.internal;
	}

	public add<T extends SchemaItem>(item: T): T {
		this.internal.push(item);
		return item;
	}

	public clone(): Schema {
		const schema = new Schema();
		schema.internal = this.internal.map(item => {
			if (isSchemaItem(item)) {
				const cloned = item.clone();
				cloned.setParent(null);
				return cloned;
			} else if (typeof item === "object") {
				return cloneDeep(item);
			} else {
				return item;
			}
		});
		return schema;
	}

	/* STATICS */

	public static create<T>(
		this: new (...args: any[]) => T,
		schemaName?: string
	): T {
		return new this(schemaName);
	}

	public static ofInternal(internal: SchemaItem[], schemaName?: string) {
		const schema = new Schema(schemaName);
		schema.internal = internal;
		return schema;
	}
}

export default Schema;

// Utils
export { walk } from "./walk";

// Items
export { Group } from "./Group";
export { isSchemaItem, SchemaItem, SchemaItemOpts } from "./SchemaItem";

// Types
export {
	AnySchemaItemType,
	BuildCallback,
	GroupSchemaItemType,
	ItemFunction,
	RootSchemaItemType,
	SchemaItemType,
	UnknownSchemaItemType
} from "./types";
