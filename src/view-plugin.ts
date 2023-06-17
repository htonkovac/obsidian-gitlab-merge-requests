import {
    ViewUpdate,
    PluginValue,
    EditorView,
    ViewPlugin,
    DecorationSet,
    PluginSpec,
    Decoration,
    MatchDecorator,
    WidgetType,
} from "@codemirror/view";

import { RangeSet, StateField } from "@codemirror/state"

import GitlabApi from "./gitlab-api"
import { editorLivePreviewField } from "obsidian"

import { renderMR } from './inline-mr-renderer';


class InlineIssueWidget extends WidgetType {
    private mrID: string
    private _htmlContainer: HTMLElement
    constructor(mrID: string) {
        super()
        this.mrID = mrID

        this._htmlContainer = createDiv({ cls: 'gitlab-inline-merge-request gitlab-merge-request-container' })
        this.buildTag()
    }

    buildTag() {
        GitlabApi.getMR(this.mrID).then(mr => {
            this._htmlContainer.replaceChildren(renderMR(mr))
        }).catch(err => {
            console.log(err)
        })
    }

    toDOM(view: EditorView): HTMLElement {
        return this._htmlContainer
    }
}

const isEditorInLivePreviewMode = (view: EditorView) => view.state.field(editorLivePreviewField as unknown as StateField<boolean>)
const isCursorInsideTag = (view: EditorView, start: number, length: number) => {
    const cursor = view.state.selection.main.head
    return (cursor > start - 1 && cursor < start + length + 1)
}
const isSelectionContainsTag = (view: EditorView, start: number, length: number) => {
    const selectionBegin = view.state.selection.main.from
    const selectionEnd = view.state.selection.main.to
    return (selectionEnd > start - 1 && selectionBegin < start + length + 1)
}

class ExamplePlugin implements PluginValue {
    decorations: DecorationSet;
    constructor(view: EditorView) {

        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            console.log('docChanged or viewportChanged')
            this.decorations = this.buildDecorations(update.view);
        }

        // console.log(update.changes)
        // if (update.docChanged) {
        //     console.log('docChanged')
        // }
        // else if (update.viewportChanged) {
        //     console.log('viewportChanged')
        // } else {
        //     console.log('other')
        // }


    }
    buildDecorations(view: EditorView): DecorationSet {
        console.log('buildDecorations')

        const gitlabUrl = "https://gitlab.com"

        const matchDeco = new MatchDecorator({
            regexp: new RegExp(`${gitlabUrl}/(.*)/-/merge_requests/([0-9]+)`, 'g'),
            decoration: (match: RegExpExecArray, view: EditorView, pos: number) => {
                console.log("MATCHY")
                console.log(match)
                const mrId = match[1] + "!" + match[2]
                const tagLength = match[0].length
                //FIXME: this is not working
                // if (!isEditorInLivePreviewMode(view) || isCursorInsideTag(view, pos, tagLength) || isSelectionContainsTag(view, pos, tagLength)) {
                //     return Decoration.mark({
                //         tagName: 'div',
                //         class: 'HyperMD-codeblock HyperMD-codeblock-bg gitlab-merge-request-inline-mark',
                //     })}
                return Decoration.replace({
                    widget: new InlineIssueWidget(mrId),
                })
            }
        })

        return matchDeco.createDeco(view)
    }

    destroy() {
        console.log('destroy')
    }
}

const pluginSpec: PluginSpec<ExamplePlugin> = {
    decorations: (value: ExamplePlugin) => value.decorations,
};

export const examplePlugin = ViewPlugin.fromClass(
    ExamplePlugin,
    pluginSpec
);
