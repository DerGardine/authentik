import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { AKResponse } from "../../api/Client";
import { TablePage } from "../../elements/table/TablePage";

import "../../elements/buttons/ModalButton";
import "../../elements/buttons/Dropdown";
import "../../elements/buttons/TokenCopyButton";
import "../../elements/forms/DeleteForm";
import { TableColumn } from "../../elements/table/Table";
import { PAGE_SIZE } from "../../constants";
import { CoreApi, Token } from "authentik-api";
import { DEFAULT_CONFIG } from "../../api/Config";

@customElement("ak-token-list")
export class TokenListPage extends TablePage<Token> {
    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return gettext("Tokens");
    }
    pageDescription(): string {
        return gettext("Tokens are used throughout authentik for Email validation stages, Recovery keys and API access.");
    }
    pageIcon(): string {
        return "pf-icon pf-icon-security";
    }

    @property()
    order = "expires";

    apiEndpoint(page: number): Promise<AKResponse<Token>> {
        return new CoreApi(DEFAULT_CONFIG).coreTokensList({
            ordering: this.order,
            page: page,
            pageSize: PAGE_SIZE,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn("Identifier", "identifier"),
            new TableColumn("User", "user"),
            new TableColumn("Expires?", "expiring"),
            new TableColumn("Expiry date", "expires"),
            new TableColumn(""),
        ];
    }

    row(item: Token): TemplateResult[] {
        return [
            html`${item.identifier}`,
            html`${item.user.username}`,
            html`${item.expiring ? "Yes" : "No"}`,
            html`${item.expiring ? item.expires?.toLocaleString() : "-"}`,
            html`
            <ak-forms-delete
                .obj=${item}
                objectLabel=${gettext("Token")}
                .delete=${() => {
                    return new CoreApi(DEFAULT_CONFIG).coreTokensDelete({
                        identifier: item.identifier
                    });
                }}>
                <button slot="trigger" class="pf-c-button pf-m-danger">
                    ${gettext("Delete")}
                </button>
            </ak-forms-delete>
            <ak-token-copy-button identifier="${item.identifier}">
                ${gettext("Copy Key")}
            </ak-token-copy-button>
            `,
        ];
    }

}
