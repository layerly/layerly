import { isSchemaItem, SchemaItem, SchemaItemOpts } from "./SchemaItem";
import { SchemaItemType, GroupSchemaItemType } from "./types";

interface GroupOptions {}

class Group extends SchemaItem {
	public static Type = GroupSchemaItemType;
	protected options?: GroupOptions;
	constructor(opts?: SchemaItemOpts) {
		super(opts);
	}

	public append(...customItem: any[]) {
		customItem.forEach(item => {
			if (isSchemaItem(item)) item.setParent(this);
		});
		(this.internal as any[]).push(...customItem);
		return this;
	}

	public assertInternalIsValid() {
		const types: SchemaItemType[] = [];
		for (const item of this.internal) {
			types.push(item.type);
		}
		// TODO make assertion in extended FormGroup schema
		// if (
		// 	includes(types, SchemaItemType.SHAPE) &&
		// 	includes(types, SchemaItemType.LIST)
		// ) {
		// 	throw new Error(
		// 		`Detected shape and list in same group. Cannot merge lists together with shapes`
		// 	);
		// }
		return true;
	}

	public static of(internal: SchemaItem[]) {
		const group = new Group();
		group.internal = internal;
		(group.internal as any[]).forEach(internal => {
			if (isSchemaItem(internal)) {
				internal.setParent(group);
			}
		});
		return group;
	}
}

function isGroup(item: SchemaItem): item is Group {
	return item instanceof Group;
}

export { isGroup, Group, GroupOptions };
