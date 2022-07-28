/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
//plotty
import  Plotly  from 'plotly.js-dist';
import ISelectionManager = powerbi.extensibility.ISelectionManager; import ISelectionId = powerbi.visuals.ISelectionId; import IVisualHost = powerbi.extensibility.visual.IVisualHost;


import { VisualSettings } from "./settings";
import { select } from "d3";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private host: IVisualHost;
    private selectionManager: ISelectionManager;


  constructor(options: VisualConstructorOptions) {
      this.host = options.host;
      this.selectionManager = this.host.createSelectionManager();
      //debugger;
      console.log('Visual constructor', options);

      this.target = options.element;
      this.updateCount = 0;
      if (document) {
          const new_p: HTMLElement = document.createElement("p");
          new_p.appendChild(document.createTextNode("Update count:"));
          const new_em: HTMLElement = document.createElement("em");
          this.textNode = document.createTextNode(this.updateCount.toString());
          new_em.appendChild(this.textNode);
          new_p.appendChild(new_em);
          this.target.appendChild(new_p);
      }

        
    }

    public update(options: VisualUpdateOptions) {
        let selectionManager = this.selectionManager;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        if (this.textNode) {  
            this.textNode.textContent = (this.updateCount++).toString();
        } 
      //  debugger;
       // var e = document.querySelector("p.js-plotly-plot");
      // e.innerHTML = "";

        // categories
        
        var labels = options.dataViews[0].categorical.categories[0].values;
        //add index positions to the values
        let DV = options.dataViews
        let category = DV[0].categorical.categories[0];
        let vals = category.values;

        const map2 = vals.map(function (element, index) {
            let selectionId: ISelectionId = this.host.createSelectionIdBuilder()
                .withCategory(category, index)
                .createSelectionId();
            return [index, element, selectionId]
        }, this) //add index of value
        let l = map2.length;


        //debugger;

        var e = document.querySelector("div");
       // e.innerHTML = "";

        // Write TypeScript code!
        //const appDiv: HTMLElement = document.getElementById('p');
        //appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;
       // var labels = labels.splice(5);

        var values = options.dataViews[0].categorical.values[0].values;
        //values = values.splice(5);
        values.push(0);


        var txt = options.dataViews[0].categorical.values[0].values;
        txt.push("Total");
        var data = [
            {
                name: "2018",
                type: "waterfall",
                orientation: "h",
                
                y: labels,
                x: values,
                text: txt,
                connector: {
                    mode: "between",
                    line: {
                        width: 4,
                        color: "rgb(0, 0, 0)",
                        dash: 0
                    }
                }
            }
        ];
        var layout = {
            title: {
                text: "Inkomsten vs. Uitgaven"
            },
            yaxis: {
                type: "category",
                autorange: "reversed"
            },
            xaxis: {
                type: "linear"
            },
            margin: { l: 150, r: 10 },
            showlegend: false
        }
        Plotly.newPlot(selectionManager, e, data, layout);
        
        var d = document.querySelectorAll("g.cartesianlayer > g > g.yaxislayer-above > g > text");
        //var d = document.querySelectorAll("em");
        
        for (let i = 0; i < d.length; i++) {
           // console.log(d[i]);
            d[i].attributes[0].ownerElement["sid"] = map2[d.length - i][2];
            //console.log(map2[i][1]);
        //};
       // d.forEach(function (el) {
            //el.setAttribute("__data__", "test");
            //el.attributes[0].ownerElement["sid"] = "";
            d[i].addEventListener('click', function emit(event) {
                //this.attributes[0].ownerElement.__data__.setAttribute( "id",  "test" );
                console.log(this.attributes[0].ownerElement.__data__);
            });
        };

        //moving element so its clickable
        var fragment = document.createDocumentFragment();
        fragment.appendChild(document.querySelector('svg > g.cartesianlayer > g > g.yaxislayer-above'));
        document.querySelector('div > svg > g.draglayer.cursor-crosshair > g').appendChild(fragment);
        
        

    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}