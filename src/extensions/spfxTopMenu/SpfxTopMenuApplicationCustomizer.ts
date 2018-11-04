import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import * as React from'react';
import * as ReactDom from 'react-dom';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from "@pnp/sp";

import TopMenu, {ITopMenuProps} from './components/TopMenu';

import * as strings from 'SpfxTopMenuApplicationCustomizerStrings';

const LOG_SOURCE: string = 'SpfxTopMenuApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISpfxTopMenuApplicationCustomizerProperties {
  // This is an example; replace with your own property
  TermSetId: string;
  DepSetId: string;
  Top:string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SpfxTopMenuApplicationCustomizer
  extends BaseApplicationCustomizer<ISpfxTopMenuApplicationCustomizerProperties> {
    public DepSetId: string;
    public Top:string;

  private _topPlaceholder:PlaceholderContent | undefined;
    

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    
    let message: string = this.properties.TermSetId;
    let departmentMessage :string = this.properties.DepSetId;
    return super.onInit().then(_ => {
        // other init code may be present
        sp.setup({
            spfxContext: this.context
        });

        this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
        this._renderPlaceHolders();
    });

  }

  private _renderPlaceHolders(): void {
    console.log("SpfxTopMenuApplicationCustomizer._renderPlaceHolders()");
    console.log(
        "Available placeholders: ",
        this.context.placeholderProvider.placeholderNames
            .map(name => PlaceholderName[name])
            .join(", ")
    );

    // Handling the top placeholder
    if (!this._topPlaceholder) {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
            PlaceholderName.Top,
            { onDispose: this._onDispose }
        );

        // The extension should not assume that the expe cted placeholder is available.
        if (!this._topPlaceholder) {
            console.error("The expected placeholder (Top) was not found.");
            return;
        }

        if (this.properties) {
            // set ID
            let termSetId: string = this.properties.TermSetId;
            let depSetId:string=this.properties.DepSetId;

            if (!termSetId) {
                termSetId = "(TermSetId property was not defined.)";
            }

            if(!depSetId){
                depSetId = "(DepSet property was not defined)";
            }

            if (this._topPlaceholder.domElement) {
               
                const element:React.ReactElement<ITopMenuProps> = React.createElement(
                TopMenu,{
                    terSetId : this.properties.TermSetId,
                    depSetId:this.properties.DepSetId
                }
            );
            ReactDom.render(element,this._topPlaceholder.domElement);
            }
        }
    }
  }
  private _onDispose(): void {
    console.log('[SpfxTopMenuApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }

}