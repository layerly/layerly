import classnames from "classnames";
import * as React from "react";

import styled from "styled-components";
import { string } from "yup";
import { SchemaInput } from "./Input";
import { StyledError } from "./styled/styledError";
import { StyledFormGroup } from "./styled/styledFormGroup";
import { StyledInfo } from "./styled/styledInfo";
import { StyledLabel } from "./styled/styledLabel";
import { InputType } from "./types";
const { Editor } = require("@tinymce/tinymce-react");

interface Props extends React.InputHTMLAttributes<any> {
	label?: string;
	info?: string;
	name?: string;
	onChange?: (e) => void;
	value?: string;
	validation?: string;
}

interface State {
	tinymceLoaded: boolean;
}

const S_KEY = 83;

class ArticleInputWithState extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.state = {
			tinymceLoaded: false
		};
	}

	public componentDidMount() {
		// require("tinymce/tinymce");
		// require("tinymce/plugins/advlist/plugin");
		// require("tinymce/plugins/anchor/plugin");
		// require("tinymce/plugins/autolink/plugin");
		// require("tinymce/plugins/autoresize/plugin");
		// require("tinymce/plugins/charmap/plugin");
		// require("tinymce/plugins/code/plugin");
		// require("tinymce/plugins/contextmenu/plugin");
		// require("tinymce/plugins/directionality/plugin");
		// require("tinymce/plugins/emoticons/plugin");
		// require("tinymce/plugins/fullscreen/plugin");
		// require("tinymce/plugins/hr/plugin");
		// require("tinymce/plugins/image/plugin");
		// require("tinymce/plugins/insertdatetime/plugin");
		// require("tinymce/plugins/link/plugin");
		// require("tinymce/plugins/lists/plugin");
		// require("tinymce/plugins/media/plugin");
		// require("tinymce/plugins/nonbreaking/plugin");
		// require("tinymce/plugins/pagebreak/plugin");
		// require("tinymce/plugins/paste/plugin");
		// require("tinymce/plugins/preview/plugin");
		// require("tinymce/plugins/print/plugin");
		// require("tinymce/plugins/save/plugin");
		// require("tinymce/plugins/searchreplace/plugin");
		// require("tinymce/plugins/spellchecker/plugin");
		// require("tinymce/plugins/table/plugin");
		// require("tinymce/plugins/template/plugin");
		// require("tinymce/plugins/textcolor/plugin");
		// require("tinymce/plugins/visualblocks/plugin");
		// require("tinymce/plugins/visualchars/plugin");
		// require("tinymce/plugins/wordcount/plugin");
		// require("tinymce/skins/lightgray/content.min.css");
		// require("tinymce/skins/lightgray/skin.min.css");
		// require("tinymce/themes/modern/theme");
		// @ts-ignore
		// tinymce.baseURL = '/tinymce/js';
		this.setState({ tinymceLoaded: true });
	}

	private handleChange(e) {
		const name = this.props.name!;
		const value = e.target.getContent();
		const fakeInput = document.createElement("input");
		fakeInput.setAttribute("name", name);
		fakeInput.setAttribute("value", value);
		if (this.props.onChange) {
			fakeInput.onchange = this.props.onChange;
		}
		const fakeEvent = document.createEvent("HTMLEvents");
		fakeEvent.initEvent("change", false, true);
		fakeInput.dispatchEvent(fakeEvent);
	}

	public render() {
		if (!this.state.tinymceLoaded) return null;
		return (
			<Editor
				apiKey={process.env.TINYMCE_API_KEY}
				onChange={this.handleChange}
				initialValue={this.props.value}
				init={{
					statusbar: false,
					menubar: false,
					plugins: [
						"save autoresize advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
						"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
						"table directionality emoticons template paste"
					],
					toolbar:
						"styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table link image | print preview media fullpage | forecolor backcolor emoticons",
					min_height: 400,
					autoresize_bottom_margin: 50,
					save_onsavecallback: () => {
						// prevent for saving html iframe
					}
				}}
			/>
		);
	}
}

export class ArticleInput extends SchemaInput {
	constructor() {
		super();
		this.inputType = InputType.Article;
		this.validationSchema = string();
		this.custom.set("emptyValue", "");
	}

	public render(props: Props) {
		let { label, info } = props;
		const { validation } = props;
		label = label || this.properties.get("label");
		info = info || this.properties.get("info");
		const error = validation ? validation : this.custom.get("error");
		return (
			<StyledArticleFormGroup error={!!error} className={classnames({ error })}>
				{label ? (
					<StyledArticleLabel hasInfo={!!info}>{label}</StyledArticleLabel>
				) : null}
				{info ? <StyledArticleInfo>{info}</StyledArticleInfo> : null}
				{error ? <StyledArticleError>{error}</StyledArticleError> : null}
				<ArticleInputWithState {...props} />
			</StyledArticleFormGroup>
		);
	}

	public static Render(props: Props) {
		return articleinput().render(props);
	}
}

const StyledArticleFormGroup = styled(StyledFormGroup)`
	.mce-container {
		${(props: { error?: boolean }) =>
			props.error ? `border-color: #dc3545;` : ""}
	}
`;

const StyledArticleLabel = styled(StyledLabel)`
	${(props: { hasInfo?: boolean }) =>
		props.hasInfo ? `margin-bottom: 0;` : ""};
`;

const StyledArticleInfo = styled(StyledInfo)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

const StyledArticleError = styled(StyledError)`
	margin-top: 0;
	margin-bottom: 0.25rem;
`;

export const articleinput = () => {
	return new ArticleInput();
};
