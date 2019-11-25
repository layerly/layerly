import { isSchemaItem, SchemaItem } from "@layerly/schema";
import { CSSObject } from "styled-components";
import { GridBlockSchemaItemType } from "./types";

interface GridBlockOptions {}

class GridBlock extends SchemaItem {
	public static Type = GridBlockSchemaItemType;
	protected options?: GridBlockOptions;
	constructor(opts?) {
		super(opts);
		this.custom.set("size", "col");
		this.custom.set("className", []);
		this.custom.set("style", {});
	}

	public size(size: number);
	public size(...size: string[]);
	public size(...args: (number | string)[]) {
		if (typeof args[0] === "number") {
			this.custom.set("size", "col-" + args[0]);
		} else {
			this.custom.set("size", args.join(" "));
		}
	}

	public className(className: string) {
		const currentClassNames = this.custom.get("className");
		this.custom.set("className", [...currentClassNames, className]);
	}

	public style(styleObject: CSSObject) {
		this.custom.set("style", styleObject);
	}

	// TODO refactor to add with single item to add
	public append(...customItem: any[]) {
		customItem.forEach(item => {
			if (isSchemaItem(item)) item.setParent(this);
		});
		(this.internal as any[]).push(...customItem);
	}
}

function isGridBock(item: any): item is GridBlock {
	return item instanceof GridBlock;
}

export { isGridBock, GridBlock, GridBlockOptions };
