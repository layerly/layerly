import * as React from "react";
import { SortableElement } from "react-sortable-hoc";
import styled from "styled-components";
import { ReactFormLayout } from "../FormSchemaBuilder";
import { SortHandle } from "./SortHandle";

interface Props {
	FieldsGroup: ReactFormLayout;
	index: number;
	itemIndex: number;
	itemData: any;
	itemValidation?: any;
	isSortable?: boolean;
	isStatic?: boolean;
	sortIsPrevented?: boolean;
	isLastItem: boolean;
	onChange: (index: number, name: string, value: any) => void;
	onRemove: (index: number) => void;
}

interface State {}

@(SortableElement as any)
export class ArrayField extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};

		this.handleChange = this.handleChange.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
	}

	private handleRemove(e) {
		e.preventDefault();
		this.props.onRemove(this.props.itemIndex);
	}

	private handleChange(name: string, value: any) {
		this.props.onChange(this.props.itemIndex, name, value);
	}

	public render() {
		const {
			FieldsGroup,
			itemData,
			itemValidation,
			isSortable,
			isStatic,
			isLastItem,
			sortIsPrevented
		} = this.props;
		return (
			<ArrayFieldStyled isSortable={isSortable}>
				<FieldStyled isLastItem={isLastItem}>
					{isSortable ? <SortHandle disabled={sortIsPrevented} /> : null}
					{isStatic === false ? (
						<RemoveButton onClick={this.handleRemove}>&times;</RemoveButton>
					) : null}
					<FieldsGroup
						values={itemData}
						validation={itemValidation}
						onChange={this.handleChange}
					/>
				</FieldStyled>
			</ArrayFieldStyled>
		);
	}
}

export const ArrayFieldStyled = styled.div`
	position: relative;
	background: white;
	padding-left: 20px;
	${(props: { isSortable?: boolean }) =>
		props.isSortable ? "padding-left: 40px;" : ""}
`;

const FieldStyled = styled.div`
	padding-top: calc(1rem + 20px);
	padding-bottom: 20px;
	${(props: { isLastItem?: boolean }) =>
		props.isLastItem === false ? `border-bottom: 1px solid #e2e2e2;` : ""};
`;

const RemoveButton = styled.div`
	position: absolute;
	right: 5px;
	top: 5px;
	cursor: pointer;
`;
