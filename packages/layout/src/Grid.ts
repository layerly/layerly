import { SchemaItem, SchemaItemOpts } from "@layerly/schema";
import { GridSchemaItemType } from "./types";

interface GridOptions {}

export class Grid extends SchemaItem {
	public static Type = GridSchemaItemType;
	protected options?: GridOptions;
	constructor(opts?: SchemaItemOpts) {
		super(opts);
	}
}

function isGrid(item: any): item is Grid {
	return item instanceof Grid;
}

export { isGrid, GridOptions };
