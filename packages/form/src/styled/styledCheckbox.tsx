
import styled from "styled-components";

export const StyledCheckboxMark = styled.span<{ error?: boolean }>`
	position: absolute;
	top: -2px;
	left: 0;
	height: 26px;
	width: 26px;
	background-color: #eee;
	border: 1px solid #d6d6d6;
	box-sizing: content-box;

	&:after {
		content: "";
		position: absolute;
		opacity: 1;
		left: 11px;
		top: 7px;
		width: 5px;
		height: 10px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		transition: transform 0.25s;
	}

	${props => (props.error ? `border-color: #dc3545;` : "")}
`;

export const StyledCheckboxLabel = styled.label`
	display: block;
	position: relative;
	padding-left: 40px;
	margin-bottom: 12px;
	cursor: pointer;
	font-size: 0.9rem;
	user-select: none;
	box-sizing: border-box;

	input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
		margin: 0;
		padding: 0;
	}

	&:hover input ~ ${StyledCheckboxMark}:after {
		opacity: 1;
		border-color: #b7b7b7;
	}

	input:checked ~ ${StyledCheckboxMark} {
		background: black;
	}

	input:checked ~ ${StyledCheckboxMark}:after {
		display: block;
		border-color: white;
		transform: rotate(405deg);
	}
`;
