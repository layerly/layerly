import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import progress from "rollup-plugin-progress";
import minify from "rollup-plugin-babel-minify";
import cleanup from "rollup-plugin-cleanup";
import del from "rollup-plugin-delete";
import pkg from "./package.json";

export default {
	input: "./src/index.ts",
	output: [
		{
			file: pkg.main,
			format: "cjs"
		},
		{
			file: pkg.module,
			format: "es"
		}
	],
	plugins: [
		progress({ clearLine: false }),
		del({
			targets: ["lib/*"]
		}),
		commonjs({
			namedExports: {
				lodash: [
					"cloneDeep",
					"each",
					"every",
					"find",
					"isPlainObject",
					"findIndex"
				]
			}
		}),
		typescript(),
		minify(),
		cleanup()
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		"react-select/async"
	]
};
