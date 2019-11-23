
import styled from "styled-components";

export const StyledRadioMark = styled.span<{ error?: boolean }>`
	position: absolute;
	top: -2px;
	left: 0;
	height: 26px;
	width: 26px;
	background-color: #eee;
	border-radius: 50%;
	border: 1px solid #d6d6d6;
	box-sizing: content-box;

	&:after {
		content: "";
		position: absolute;
		opacity: 1;
		left: 9px;
		top: 9px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: white;
	}

	${props => (props.error ? `border-color: #dc3545;` : "")}
`;

export const StyledRadioLabel = styled.label`
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

	&:hover input ~ ${StyledRadioMark}:after {
		opacity: 1;
	}

	input:checked ~ ${StyledRadioMark} {
		background: black;
		border: 1px solid transparent;
	}

	input:checked ~ ${StyledRadioMark}:after {
		display: block;
	}
`;
