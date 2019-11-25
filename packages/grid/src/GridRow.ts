import { SchemaItem } from "@layerly/schema";
import { CSSObject } from "styled-components";
import { GridRowSchemaItemType } from "./types";

interface GridRowOptions {}

class GridRow extends SchemaItem {
	public static Type = GridRowSchemaItemType;
	protected options?: GridRowOptions;
	constructor(opts?) {
		super(opts);
		this.custom.set("className", ["row"]);
		this.custom.set("style", {});
	}

	public style(styleObject: CSSObject) {
		this.custom.set("style", styleObject);
	}

	public className(className: string) {
		const currentClassNames = this.custom.get("className");
		this.custom.set("className", [...currentClassNames, className]);
	}
}

function isGridRow(item: any): item is GridRow {
	return item instanceof GridRow;
}

export { isGridRow, GridRow, GridRowOptions };
