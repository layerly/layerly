import { isSchemaItem, SchemaItem, SchemaItemOpts } from "@epranka/test-schema";
import { every, findIndex, isPlainObject } from "lodash";
import { SchemaInput } from "./Input";
import { isShape, mergeShapes } from "./Shape";
import { ListSchemaItemType } from "./types";

interface ListOptions {}

class List extends SchemaItem {
	public static Type = ListSchemaItemType;
	protected options?: ListOptions;
	protected originalInternal: any[];
	constructor(opts?: SchemaItemOpts) {
		super(opts);
		this.originalInternal = [];
		this.custom.set("sortable", false);
		this.custom.set("max", -1);
		this.custom.set("static", false);
		this.custom.set("labelForAppend", "New");
	}

	/* OPTIONS */

	public sortable(sortable = true) {
		this.custom.set("sortable", sortable);
		return this;
	}

	public max(max: number) {
		this.custom.set("max", max);
		return this;
	}

	public static(statik = true) {
		this.custom.set("static", statik);
		return this;
	}

	public labelForAppend(label: string) {
		this.custom.set("labelForAppend", label);
		return this;
	}

	public name(name: string) {
		this.custom.set("name", name);
		return this;
	}

	private *iterateForName(item: SchemaItem) {
		const parent = item.getParent();
		if (parent) {
			if (isShape(parent)) {
				yield parent.findPropertyName(item);
			}
			if (isList(parent)) return;
			yield* this.iterateForName(parent);
		}
	}

	public findName() {
		return Array.from(this.iterateForName(this))
			.reverse()
			.join(".");
	}

	private *iterateForPath(item: SchemaItem) {
		const parent = item.getParent();
		if (parent) {
			if (isShape(parent)) {
				yield parent.findPropertyName(item);
			} else if (isList(parent)) {
				yield parent.findIndex(item);
			}
			yield* this.iterateForPath(parent);
		}
	}

	public findPath() {
		return Array.from(this.iterateForPath(this))
			.reverse()
			.join(".");
	}

	public findIndex(item: SchemaItem) {
		return findIndex(this.internal, i => i === item);
	}

	public mergeInternal() {
		const internal = this.getInternal();
		const allTheShapesOrPlainObjects = every(
			internal,
			item => isShape(item) || isPlainObject(item)
		);
		const allTheSame = every(
			internal,
			(item, index, items) => index === 0 || item === items[index - 1]
		);
		if (allTheShapesOrPlainObjects) {
			const mergedShape = mergeShapes(internal);
			mergedShape.setParent(this);
			this.internal = [mergedShape];
			return this.internal;
		} else if (allTheSame) {
			const item = internal[0];
			if (item instanceof SchemaItem) {
				item.setParent(this);
			}
			this.internal = [item];
			return this.internal;
		} else {
			throw new Error(
				"Only other shapes, plain objects, or schema items which every internal item is the same, can be merged in list"
			);
		}
	}

	public getOriginalInternal() {
		return this.originalInternal;
	}

	public clone() {
		const cloned = super.clone();
		cloned.originalInternal = cloned.internal.map(item => {
			const clonedItem = item.clone();
			if (isSchemaItem(clonedItem)) {
				clonedItem.setParent(cloned);
			}
			return clonedItem;
		});
		return cloned;
	}

	/* METHODS */
	// TODO remove input (change with add)
	public input(item: SchemaInput) {
		item.setParent(this);
		(this.internal as SchemaItem[]).push(item);
	}
}

function isList(item: any): item is List {
	return item instanceof List;
}

export { isList, List, ListOptions };
