import * as React from "react";
import { SortableContainer } from "react-sortable-hoc";

import styled from "styled-components";
import { Button } from "../Button";
import { ArrayField } from "./ArrayField";

interface Props {
	FieldsGroup: any;
	value?: { [key: string]: any }[];
	validation?: { [key: string]: any }[];
	name: string;
	onItemChange: (index: number, name: string, value: any) => void;
	onItemRemove: (index: number) => void;
	onItemAppend: (evt) => void;
	maxReached?: boolean;
	lockAxis?: string;
	shouldCancelStart: () => void;
	isSortable?: boolean;
	isStatic?: boolean;
	sortIsPrevented?: boolean;
	labelForAppend: string;
	useDragHandle?: boolean;
	onSortEnd: (obj: { oldIndex: number; newIndex: number }) => void;
}

interface State {
	itemsData: { [key: string]: any }[];
}

const EMPTY_ARRAY = [];

@(SortableContainer as any)
export class ArrayOfFields extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	private getValue() {
		return this.props.value || EMPTY_ARRAY;
	}

	private getValidation() {
		return this.props.validation || EMPTY_ARRAY;
	}

	private isAppendButtonVisible() {
		return this.props.maxReached === false && !this.props.isStatic;
	}

	public render() {
		return (
			<ArrayOfFieldStyled>
				<ArrayOfFieldList>
					{this.getValue().map((itemData, index) => {
						return (
							<ArrayField
								key={index}
								index={index}
								itemIndex={index}
								itemData={itemData}
								itemValidation={this.getValidation()[index]}
								isSortable={this.props.isSortable}
								isStatic={this.props.isStatic}
								sortIsPrevented={this.props.sortIsPrevented}
								isLastItem={index === this.getValue().length - 1}
								FieldsGroup={this.props.FieldsGroup}
								onChange={this.props.onItemChange}
								onRemove={this.props.onItemRemove}
							/>
						);
					})}
				</ArrayOfFieldList>
				{this.isAppendButtonVisible() ? (
					<AppendHolder>
						<Button
							type="button"
							tabIndex={-1}
							onClick={this.props.onItemAppend}
						>
							{this.props.labelForAppend}
						</Button>
					</AppendHolder>
				) : null}
			</ArrayOfFieldStyled>
		);
	}
}

const ArrayOfFieldList = styled.ul`
	margin: 0;
	padding: 0;
	border-top: 1px solid #e2e2e2;
`;

const ArrayOfFieldStyled = styled.div``;

const AppendHolder = styled.div`
	text-align: right;
	margin-top: 20px;
	margin-bottom: 20px;
`;
