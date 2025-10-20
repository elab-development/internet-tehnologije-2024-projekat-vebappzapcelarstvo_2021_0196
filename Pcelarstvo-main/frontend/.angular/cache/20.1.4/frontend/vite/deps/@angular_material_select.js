import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-XKVTPRPH.js";
import "./chunk-6YNTRFHF.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-TAG6IQLU.js";
import "./chunk-T5YWSNCP.js";
import "./chunk-II2FCWDI.js";
import "./chunk-M6K5X7IW.js";
import "./chunk-4TVZOT4P.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-YJIYWSQY.js";
import "./chunk-6CXMNT5T.js";
import "./chunk-3ZNIQ42Y.js";
import "./chunk-ZVPQFE63.js";
import "./chunk-ABHLDVJN.js";
import "./chunk-HHAHQNZL.js";
import "./chunk-K2556SO5.js";
import "./chunk-UNKJ7FS3.js";
import "./chunk-YEHJ3ICU.js";
import "./chunk-DQ7OVFPD.js";
import "./chunk-QCETVJKM.js";
import "./chunk-EOFW2REK.js";
import "./chunk-IQTL35MF.js";
import "./chunk-HBRXMV6Z.js";
import "./chunk-ZW7JKXHT.js";
import "./chunk-A7A7JKOO.js";
import "./chunk-PO3W7GMY.js";
import "./chunk-NDZIWK7R.js";
import "./chunk-XI3T76QP.js";
import "./chunk-3KKC7HMJ.js";
import "./chunk-TXDUYLVM.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [
      {
        type: 0,
        name: "void",
        styles: {
          type: 6,
          styles: { opacity: 0, transform: "scale(1, 0.8)" },
          offset: null
        }
      },
      {
        type: 1,
        expr: "void => showing",
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: { opacity: 1, transform: "scale(1, 1)" },
            offset: null
          },
          timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
        },
        options: null
      },
      {
        type: 1,
        expr: "* => void",
        animation: {
          type: 4,
          styles: { type: 6, styles: { opacity: 0 }, offset: null },
          timings: "100ms linear"
        },
        options: null
      }
    ],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
