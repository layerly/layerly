import { cloneDeep, each, filter, map } from "lodash";
import { SchemaItemType, UnknownSchemaItemType, BuildCallback } from "./types";
const invariant = require("invariant");

interface SchemaItemOpts {
	parent?: SchemaItem;
	options?: object;
}

class SchemaItem {
	public static Type = UnknownSchemaItemType;
	protected internal: any[];
	protected disposed: boolean = false;
	protected parent: SchemaItem | null = null;

	public type: SchemaItemType = UnknownSchemaItemType;
	public custom: Map<string, any>;

	constructor(opts?: SchemaItemOpts) {
		const c = this.constructor as typeof SchemaItem;
		if (c.Type) {
			this.type = c.Type;
		}
		this.internal = [];
		this.custom = new Map();
		if (opts) {
			this.parent = opts.parent || null;
		}
	}

	public getInternal() {
		return this.internal;
	}

	public getParent() {
		return this.parent;
	}

	public setParent(parent: SchemaItem | null) {
		this.parent = parent;
	}

	public replaceInternalItem(source: any, dest: any) {
		this.internal = map(this.internal, currentSource => {
			if (currentSource === source) {
				if (isSchemaItem(dest)) {
					dest.setParent(this);
				}
				return dest;
			} else {
				return currentSource;
			}
		});
	}

	public replace(dest: any) {
		if (!this.parent) {
			throw new Error("Cannot replace item, because it doesnt have a parent");
		}
		if (typeof this.parent.replaceInternalItem === "function") {
			this.parent.replaceInternalItem(this, dest);
		}
	}

	public removeInternalItem(source: any) {
		this.internal = filter(
			this.internal,
			currentSource => currentSource !== source
		);
	}

	public mergeBeforeToParent() {
		if (this.disposed) return;
		invariant(this.parent, "No parent in SchemaItem to mergeToParent()");
		if (typeof this.parent!.mergeAfter === "function") {
			this.parent!.mergeAfter(this);
		}
	}

	public mergeAfterToParent() {
		if (this.disposed) return;
		invariant(this.parent, "No parent in SchemaItem to mergeToParent()");
		if (typeof this.parent!.mergeAfter === "function") {
			this.parent!.mergeAfter(this);
		}
	}

	public mergeBefore(child: SchemaItem) {
		if (this.disposed) return;
		const internal = child.getInternal();
		each(internal, (item: any) => isSchemaItem(item) && item.setParent(this));
		this.internal = [...internal, ...this.internal];
		child.dispose();
		this.removeInternalItem(child);
	}

	public mergeAfter(child: SchemaItem) {
		if (this.disposed) return;
		const internal = child.getInternal();
		each(internal, (item: any) => isSchemaItem(item) && item.setParent(this));
		this.internal = [...this.internal, ...internal];
		child.dispose();
		this.removeInternalItem(child);
	}

	public dispose() {
		this.parent = null;
		this.disposed = true;
	}

	public clone() {
		const item = new (this.constructor as any)();
		item.internal = this.internal.map(child => {
			if (isSchemaItem(child)) {
				const cloned = child.clone();
				cloned.setParent(item);
				return cloned;
			} else if (typeof child === "object") {
				return cloneDeep(child);
			} else {
				return child;
			}
		});
		item.type = this.type;
		item.custom = new Map(this.custom);
		return item;
	}

	public add<T extends SchemaItem>(item: T): T {
		this.internal.push(item);
		if (isSchemaItem(item)) {
			item.setParent(this);
		}
		return item;
	}

	protected createSubInstance<T extends { new (...args: any[]) }>(
		clazz: T,
		opts?: any
	): InstanceType<T> {
		const subInstance = new clazz({ parent: this, options: opts });
		(this.internal as any[]).push(subInstance);
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

	public static create<T>(
		this: new (...args: any[]) => T,
		buildCallback?: BuildCallback<T>,
		...args: any[]
	) {
		const item = new this(...args);
		if (typeof buildCallback === "function") {
			buildCallback(item);
		}
		return item;
	}
}

function isSchemaItem(item: any): item is SchemaItem {
	return item instanceof SchemaItem;
}

export { isSchemaItem, SchemaItem, SchemaItemOpts };
