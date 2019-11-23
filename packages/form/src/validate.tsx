import * as Yup from "yup";
import * as dot from "dot-prop";

type ObjectType = { [key: string]: any };

const dedotPaths = (dotAnotattedData: ObjectType) => {
	return Object.keys(dotAnotattedData).reduce((acc, itemPath) => {
		return dot.set(acc, itemPath, dotAnotattedData[itemPath]);
	}, {});
};

const getErrorsFromValidationError = (err: Yup.ValidationError) => {
	return err.inner.reduce((acc, error) => {
		return dot.set(
			acc,
			error.path
				.replace(/([^\]])\./g, "$1\\.")
				.replace(/\[/g, ".")
				.replace(/\]/g, ""),
			error.message
		);
	}, {});
};

class FormValidationError extends Error {
	public errors;
	public isFormValidationError = true;
	constructor(errors: object) {
		super("Form validation failed");
		this.errors = errors;
	}
}

export const validate = async (
	data: ObjectType,
	yupSchema: Yup.Schema<any>,
	context?: object
): Promise<ObjectType> => {
	try {
		return await yupSchema.validate(dedotPaths(data), {
			abortEarly: false,
			context
		});
	} catch (err) {
		throw new FormValidationError(getErrorsFromValidationError(err));
	}
};
