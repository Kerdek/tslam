import * as React from "react";
import { PageNav } from "./Nav";
export function Page(props) {
    return (<div className="page">
			<PageNav />
			<main className="main">{props.children}</main>
		</div>);
}
//# sourceMappingURL=Page.js.map