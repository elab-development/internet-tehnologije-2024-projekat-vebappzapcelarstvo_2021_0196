import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  LOCALE_ID,
  NgModule,
  NgZone,
  Optional,
  Output,
  inject,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵdomProperty,
  ɵɵgetInheritedFactory,
  ɵɵinject,
  ɵɵloadQuery,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵqueryRefresh
} from "./chunk-XI3T76QP.js";
import {
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  debounceTime,
  fromEvent,
  map,
  mergeMap,
  of,
  switchMap
} from "./chunk-3KKC7HMJ.js";
import {
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-TXDUYLVM.js";

// node_modules/angular-google-charts/fesm2022/angular-google-charts.mjs
var _c0 = ["*"];
var _c1 = "[_nghost-%COMP%]{width:-moz-fit-content;width:fit-content;display:block}";
var ChartEditorRef = class {
  constructor(editor) {
    this.editor = editor;
    this.doneSubject = new Subject();
    this.addEventListeners();
  }
  /**
   * Gets an observable that is notified when the dialog is saved.
   * Emits either the result if the dialog was saved or `null` if editing was cancelled.
   */
  afterClosed() {
    return this.doneSubject.asObservable();
  }
  /**
   * Stops editing the chart and closes the dialog.
   */
  cancel() {
    this.editor.closeDialog();
  }
  addEventListeners() {
    google.visualization.events.addOneTimeListener(this.editor, "ok", () => {
      google.visualization.events.removeAllListeners(this.editor);
      const updatedChartWrapper = this.editor.getChartWrapper();
      this.doneSubject.next(updatedChartWrapper);
      this.doneSubject.complete();
    });
    google.visualization.events.addOneTimeListener(this.editor, "cancel", () => {
      google.visualization.events.removeAllListeners(this.editor);
      this.doneSubject.next(null);
      this.doneSubject.complete();
    });
  }
};
var ChartType;
(function(ChartType2) {
  ChartType2["AnnotationChart"] = "AnnotationChart";
  ChartType2["AreaChart"] = "AreaChart";
  ChartType2["Bar"] = "Bar";
  ChartType2["BarChart"] = "BarChart";
  ChartType2["BubbleChart"] = "BubbleChart";
  ChartType2["Calendar"] = "Calendar";
  ChartType2["CandlestickChart"] = "CandlestickChart";
  ChartType2["ColumnChart"] = "ColumnChart";
  ChartType2["ComboChart"] = "ComboChart";
  ChartType2["PieChart"] = "PieChart";
  ChartType2["Gantt"] = "Gantt";
  ChartType2["Gauge"] = "Gauge";
  ChartType2["GeoChart"] = "GeoChart";
  ChartType2["Histogram"] = "Histogram";
  ChartType2["Line"] = "Line";
  ChartType2["LineChart"] = "LineChart";
  ChartType2["Map"] = "Map";
  ChartType2["OrgChart"] = "OrgChart";
  ChartType2["Sankey"] = "Sankey";
  ChartType2["Scatter"] = "Scatter";
  ChartType2["ScatterChart"] = "ScatterChart";
  ChartType2["SteppedAreaChart"] = "SteppedAreaChart";
  ChartType2["Table"] = "Table";
  ChartType2["Timeline"] = "Timeline";
  ChartType2["TreeMap"] = "TreeMap";
  ChartType2["WordTree"] = "WordTree";
})(ChartType || (ChartType = {}));
var ChartTypesToPackages = {
  [ChartType.AnnotationChart]: "annotationchart",
  [ChartType.AreaChart]: "corechart",
  [ChartType.Bar]: "bar",
  [ChartType.BarChart]: "corechart",
  [ChartType.BubbleChart]: "corechart",
  [ChartType.Calendar]: "calendar",
  [ChartType.CandlestickChart]: "corechart",
  [ChartType.ColumnChart]: "corechart",
  [ChartType.ComboChart]: "corechart",
  [ChartType.PieChart]: "corechart",
  [ChartType.Gantt]: "gantt",
  [ChartType.Gauge]: "gauge",
  [ChartType.GeoChart]: "geochart",
  [ChartType.Histogram]: "corechart",
  [ChartType.Line]: "line",
  [ChartType.LineChart]: "corechart",
  [ChartType.Map]: "map",
  [ChartType.OrgChart]: "orgchart",
  [ChartType.Sankey]: "sankey",
  [ChartType.Scatter]: "scatter",
  [ChartType.ScatterChart]: "corechart",
  [ChartType.SteppedAreaChart]: "corechart",
  [ChartType.Table]: "table",
  [ChartType.Timeline]: "timeline",
  [ChartType.TreeMap]: "treemap",
  [ChartType.WordTree]: "wordtree"
};
function getPackageForChart(type) {
  return ChartTypesToPackages[type];
}
function getDefaultConfig() {
  return {
    version: "current",
    safeMode: false
  };
}
var GOOGLE_CHARTS_CONFIG = new InjectionToken("GOOGLE_CHARTS_CONFIG");
var GOOGLE_CHARTS_LAZY_CONFIG = new InjectionToken("GOOGLE_CHARTS_LAZY_CONFIG", {
  providedIn: "root",
  factory: () => {
    const configFromModule = inject(GOOGLE_CHARTS_CONFIG, {
      optional: true
    });
    return of(__spreadValues(__spreadValues({}, getDefaultConfig()), configFromModule || {}));
  }
});
var _ScriptLoaderService = class _ScriptLoaderService {
  constructor(zone, localeId, config$) {
    this.zone = zone;
    this.localeId = localeId;
    this.config$ = config$;
    this.scriptSource = "https://www.gstatic.com/charts/loader.js";
    this.scriptLoadSubject = new Subject();
  }
  /**
   * Checks whether `google.charts` is available.
   *
   * If not, it can be loaded by calling `loadChartPackages`.
   *
   * @returns `true` if `google.charts` is available, `false` otherwise.
   */
  isGoogleChartsAvailable() {
    if (typeof google === "undefined" || typeof google.charts === "undefined") {
      return false;
    }
    return true;
  }
  /**
   * Loads the Google Chart script and the provided chart packages.
   * Can be called multiple times to load more packages.
   *
   * When called without any arguments, this will just load the default package
   * containing the namespaces `google.charts` and `google.visualization` without any charts.
   *
   * @param packages The packages to load.
   * @returns A stream emitting as soon as the chart packages are loaded.
   */
  loadChartPackages(...packages) {
    return this.loadGoogleCharts().pipe(mergeMap(() => this.config$), map((config) => {
      return __spreadValues(__spreadValues({}, getDefaultConfig()), config || {});
    }), switchMap((googleChartsConfig) => {
      return new Observable((observer) => {
        const config = {
          packages,
          language: this.localeId,
          mapsApiKey: googleChartsConfig.mapsApiKey,
          safeMode: googleChartsConfig.safeMode
        };
        google.charts.load(googleChartsConfig.version, config);
        google.charts.setOnLoadCallback(() => {
          this.zone.run(() => {
            observer.next();
            observer.complete();
          });
        });
      });
    }));
  }
  /**
   * Loads the Google Charts script. After the script is loaded, `google.charts` is defined.
   *
   * @returns A stream emitting as soon as loading has completed.
   * If the google charts script is already loaded, the stream emits immediately.
   */
  loadGoogleCharts() {
    if (this.isGoogleChartsAvailable()) {
      return of(void 0);
    } else if (!this.isLoadingGoogleCharts()) {
      const script = this.createGoogleChartsScript();
      script.onload = () => {
        this.zone.run(() => {
          this.scriptLoadSubject.next();
          this.scriptLoadSubject.complete();
        });
      };
      script.onerror = () => {
        this.zone.run(() => {
          console.error("Failed to load the google charts script!");
          this.scriptLoadSubject.error(new Error("Failed to load the google charts script!"));
        });
      };
    }
    return this.scriptLoadSubject.asObservable();
  }
  isLoadingGoogleCharts() {
    return this.getGoogleChartsScript() != null;
  }
  getGoogleChartsScript() {
    const pageScripts = Array.from(document.getElementsByTagName("script"));
    return pageScripts.find((script) => script.src === this.scriptSource);
  }
  createGoogleChartsScript() {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = this.scriptSource;
    script.async = true;
    document.getElementsByTagName("head")[0].appendChild(script);
    return script;
  }
};
_ScriptLoaderService.ɵfac = function ScriptLoaderService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ScriptLoaderService)(ɵɵinject(NgZone), ɵɵinject(LOCALE_ID), ɵɵinject(GOOGLE_CHARTS_LAZY_CONFIG));
};
_ScriptLoaderService.ɵprov = ɵɵdefineInjectable({
  token: _ScriptLoaderService,
  factory: _ScriptLoaderService.ɵfac
});
var ScriptLoaderService = _ScriptLoaderService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScriptLoaderService, [{
    type: Injectable
  }], function() {
    return [{
      type: NgZone
    }, {
      type: void 0,
      decorators: [{
        type: Inject,
        args: [LOCALE_ID]
      }]
    }, {
      type: Observable,
      decorators: [{
        type: Inject,
        args: [GOOGLE_CHARTS_LAZY_CONFIG]
      }]
    }];
  }, null);
})();
var _ChartEditorComponent = class _ChartEditorComponent {
  constructor(scriptLoaderService) {
    this.scriptLoaderService = scriptLoaderService;
    this.initializedSubject = new Subject();
  }
  /**
   * Emits as soon as the chart editor is fully initialized.
   */
  get initialized$() {
    return this.initializedSubject.asObservable();
  }
  ngOnInit() {
    this.scriptLoaderService.loadChartPackages("charteditor").subscribe(() => {
      this.editor = new google.visualization.ChartEditor();
      this.initializedSubject.next(this.editor);
      this.initializedSubject.complete();
    });
  }
  editChart(component, options) {
    if (!component.chartWrapper) {
      throw new Error("Chart wrapper is `undefined`. Please wait for the `initialized$` observable before trying to edit a chart.");
    }
    if (!this.editor) {
      throw new Error("Chart editor is `undefined`. Please wait for the `initialized$` observable before trying to edit a chart.");
    }
    const handle = new ChartEditorRef(this.editor);
    this.editor.openDialog(component.chartWrapper, options || {});
    handle.afterClosed().subscribe((result) => {
      if (result) {
        component.chartWrapper = result;
      }
    });
    return handle;
  }
};
_ChartEditorComponent.ɵfac = function ChartEditorComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ChartEditorComponent)(ɵɵdirectiveInject(ScriptLoaderService));
};
_ChartEditorComponent.ɵcmp = ɵɵdefineComponent({
  type: _ChartEditorComponent,
  selectors: [["chart-editor"]],
  hostAttrs: [1, "chart-editor"],
  standalone: false,
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function ChartEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
var ChartEditorComponent = _ChartEditorComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartEditorComponent, [{
    type: Component,
    args: [{
      selector: "chart-editor",
      template: `<ng-content></ng-content>`,
      host: {
        class: "chart-editor"
      },
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], function() {
    return [{
      type: ScriptLoaderService
    }];
  }, null);
})();
var _DataTableService = class _DataTableService {
  create(data, columns, formatters) {
    if (data == null) {
      return void 0;
    }
    let firstRowIsData = true;
    if (columns != null) {
      firstRowIsData = false;
    }
    const dataTable = google.visualization.arrayToDataTable(this.getDataAsTable(data, columns), firstRowIsData);
    if (formatters) {
      this.applyFormatters(dataTable, formatters);
    }
    return dataTable;
  }
  getDataAsTable(data, columns) {
    if (columns) {
      return [columns, ...data];
    } else {
      return data;
    }
  }
  applyFormatters(dataTable, formatters) {
    for (const val of formatters) {
      val.formatter.format(dataTable, val.colIndex);
    }
  }
};
_DataTableService.ɵfac = function DataTableService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DataTableService)();
};
_DataTableService.ɵprov = ɵɵdefineInjectable({
  token: _DataTableService,
  factory: _DataTableService.ɵfac,
  providedIn: "root"
});
var DataTableService = _DataTableService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DataTableService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function generateRandomId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}
var FilterType;
(function(FilterType2) {
  FilterType2["Category"] = "CategoryFilter";
  FilterType2["ChartRange"] = "ChartRangeFilter";
  FilterType2["DateRange"] = "DateRangeFilter";
  FilterType2["NumberRange"] = "NumberRangeFilter";
  FilterType2["String"] = "StringFilter";
})(FilterType || (FilterType = {}));
var _ControlWrapperComponent = class _ControlWrapperComponent {
  constructor(loaderService) {
    this.loaderService = loaderService;
    this.error = new EventEmitter();
    this.ready = new EventEmitter();
    this.stateChange = new EventEmitter();
    this.id = generateRandomId();
    this.wrapperReadySubject = new ReplaySubject(1);
  }
  /**
   * Emits after the `ControlWrapper` was created.
   */
  get wrapperReady$() {
    return this.wrapperReadySubject.asObservable();
  }
  get controlWrapper() {
    if (!this._controlWrapper) {
      throw new Error(`Cannot access the control wrapper before it being initialized.`);
    }
    return this._controlWrapper;
  }
  ngOnInit() {
    this.loaderService.loadChartPackages("controls").subscribe(() => {
      this.createControlWrapper();
    });
  }
  ngOnChanges(changes) {
    if (!this._controlWrapper) {
      return;
    }
    if (changes.type) {
      this._controlWrapper.setControlType(this.type);
    }
    if (changes.options) {
      this._controlWrapper.setOptions(this.options || {});
    }
    if (changes.state) {
      this._controlWrapper.setState(this.state || {});
    }
  }
  createControlWrapper() {
    this._controlWrapper = new google.visualization.ControlWrapper({
      containerId: this.id,
      controlType: this.type,
      state: this.state,
      options: this.options
    });
    this.addEventListeners();
    this.wrapperReadySubject.next(this._controlWrapper);
  }
  addEventListeners() {
    google.visualization.events.removeAllListeners(this._controlWrapper);
    google.visualization.events.addListener(this._controlWrapper, "ready", (event) => this.ready.emit(event));
    google.visualization.events.addListener(this._controlWrapper, "error", (event) => this.error.emit(event));
    google.visualization.events.addListener(this._controlWrapper, "statechange", (event) => this.stateChange.emit(event));
  }
};
_ControlWrapperComponent.ɵfac = function ControlWrapperComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ControlWrapperComponent)(ɵɵdirectiveInject(ScriptLoaderService));
};
_ControlWrapperComponent.ɵcmp = ɵɵdefineComponent({
  type: _ControlWrapperComponent,
  selectors: [["control-wrapper"]],
  hostAttrs: [1, "control-wrapper"],
  hostVars: 1,
  hostBindings: function ControlWrapperComponent_HostBindings(rf, ctx) {
    if (rf & 2) {
      ɵɵdomProperty("id", ctx.id);
    }
  },
  inputs: {
    for: "for",
    type: "type",
    options: "options",
    state: "state"
  },
  outputs: {
    error: "error",
    ready: "ready",
    stateChange: "stateChange"
  },
  exportAs: ["controlWrapper"],
  standalone: false,
  features: [ɵɵNgOnChangesFeature],
  decls: 0,
  vars: 0,
  template: function ControlWrapperComponent_Template(rf, ctx) {
  },
  encapsulation: 2,
  changeDetection: 0
});
var ControlWrapperComponent = _ControlWrapperComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ControlWrapperComponent, [{
    type: Component,
    args: [{
      selector: "control-wrapper",
      template: "",
      host: {
        class: "control-wrapper"
      },
      exportAs: "controlWrapper",
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], function() {
    return [{
      type: ScriptLoaderService
    }];
  }, {
    for: [{
      type: Input
    }],
    type: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    state: [{
      type: Input
    }],
    error: [{
      type: Output
    }],
    ready: [{
      type: Output
    }],
    stateChange: [{
      type: Output
    }],
    id: [{
      type: HostBinding,
      args: ["id"]
    }]
  });
})();
var _DashboardComponent = class _DashboardComponent {
  constructor(element, loaderService, dataTableService) {
    this.element = element;
    this.loaderService = loaderService;
    this.dataTableService = dataTableService;
    this.ready = new EventEmitter();
    this.error = new EventEmitter();
    this.initialized = false;
  }
  ngOnInit() {
    this.loaderService.loadChartPackages("controls").subscribe(() => {
      this.dataTable = this.dataTableService.create(this.data, this.columns, this.formatters);
      this.createDashboard();
      this.initialized = true;
    });
  }
  ngOnChanges(changes) {
    if (!this.initialized) {
      return;
    }
    if (changes.data || changes.columns || changes.formatters) {
      this.dataTable = this.dataTableService.create(this.data, this.columns, this.formatters);
      this.dashboard.draw(this.dataTable);
    }
  }
  createDashboard() {
    const controlWrappersReady$ = this.controlWrappers.map((control) => control.wrapperReady$);
    const chartsReady$ = this.controlWrappers.map((control) => control.for).map((charts) => {
      if (Array.isArray(charts)) {
        return combineLatest(charts.map((chart) => chart.wrapperReady$));
      } else {
        return charts.wrapperReady$;
      }
    });
    combineLatest([...controlWrappersReady$, ...chartsReady$]).subscribe(() => {
      this.dashboard = new google.visualization.Dashboard(this.element.nativeElement);
      this.initializeBindings();
      this.registerEvents();
      this.dashboard.draw(this.dataTable);
    });
  }
  registerEvents() {
    google.visualization.events.removeAllListeners(this.dashboard);
    const registerDashEvent = (object, eventName, callback) => {
      google.visualization.events.addListener(object, eventName, callback);
    };
    registerDashEvent(this.dashboard, "ready", () => this.ready.emit());
    registerDashEvent(this.dashboard, "error", (error) => this.error.emit(error));
  }
  initializeBindings() {
    this.controlWrappers.forEach((control) => {
      if (Array.isArray(control.for)) {
        const chartWrappers = control.for.map((chart) => chart.chartWrapper);
        this.dashboard.bind(control.controlWrapper, chartWrappers);
      } else {
        this.dashboard.bind(control.controlWrapper, control.for.chartWrapper);
      }
    });
  }
};
_DashboardComponent.ɵfac = function DashboardComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DashboardComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ScriptLoaderService), ɵɵdirectiveInject(DataTableService));
};
_DashboardComponent.ɵcmp = ɵɵdefineComponent({
  type: _DashboardComponent,
  selectors: [["dashboard"]],
  contentQueries: function DashboardComponent_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, ControlWrapperComponent, 4);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.controlWrappers = _t);
    }
  },
  hostAttrs: [1, "dashboard"],
  inputs: {
    data: "data",
    columns: "columns",
    formatters: "formatters"
  },
  outputs: {
    ready: "ready",
    error: "error"
  },
  exportAs: ["dashboard"],
  standalone: false,
  features: [ɵɵNgOnChangesFeature],
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function DashboardComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
var DashboardComponent = _DashboardComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DashboardComponent, [{
    type: Component,
    args: [{
      selector: "dashboard",
      template: "<ng-content></ng-content>",
      changeDetection: ChangeDetectionStrategy.OnPush,
      exportAs: "dashboard",
      host: {
        class: "dashboard"
      }
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: ScriptLoaderService
    }, {
      type: DataTableService
    }];
  }, {
    data: [{
      type: Input
    }],
    columns: [{
      type: Input
    }],
    formatters: [{
      type: Input
    }],
    ready: [{
      type: Output
    }],
    error: [{
      type: Output
    }],
    controlWrappers: [{
      type: ContentChildren,
      args: [ControlWrapperComponent]
    }]
  });
})();
var _GoogleChartComponent = class _GoogleChartComponent {
  constructor(element, scriptLoaderService, dataTableService, dashboard) {
    this.element = element;
    this.scriptLoaderService = scriptLoaderService;
    this.dataTableService = dataTableService;
    this.dashboard = dashboard;
    this.options = {};
    this.dynamicResize = false;
    this.ready = new EventEmitter();
    this.error = new EventEmitter();
    this.select = new EventEmitter();
    this.mouseover = new EventEmitter();
    this.mouseleave = new EventEmitter();
    this.wrapperReadySubject = new ReplaySubject(1);
    this.initialized = false;
    this.eventListeners = /* @__PURE__ */ new Map();
  }
  get chart() {
    return this.chartWrapper.getChart();
  }
  get wrapperReady$() {
    return this.wrapperReadySubject.asObservable();
  }
  get chartWrapper() {
    if (!this.wrapper) {
      throw new Error("Trying to access the chart wrapper before it was fully initialized");
    }
    return this.wrapper;
  }
  set chartWrapper(wrapper) {
    this.wrapper = wrapper;
    this.drawChart();
  }
  ngOnInit() {
    this.scriptLoaderService.loadChartPackages(getPackageForChart(this.type)).subscribe(() => {
      this.dataTable = this.dataTableService.create(this.data, this.columns, this.formatters);
      this.wrapper = new google.visualization.ChartWrapper({
        container: this.element.nativeElement,
        chartType: this.type,
        dataTable: this.dataTable,
        options: this.mergeOptions()
      });
      this.registerChartEvents();
      this.wrapperReadySubject.next(this.wrapper);
      this.initialized = true;
      this.drawChart();
    });
  }
  ngOnChanges(changes) {
    if (changes.dynamicResize) {
      this.updateResizeListener();
    }
    if (this.initialized) {
      let shouldRedraw = false;
      if (changes.data || changes.columns || changes.formatters) {
        this.dataTable = this.dataTableService.create(this.data, this.columns, this.formatters);
        this.wrapper.setDataTable(this.dataTable);
        shouldRedraw = true;
      }
      if (changes.type) {
        this.wrapper.setChartType(this.type);
        shouldRedraw = true;
      }
      if (changes.options || changes.width || changes.height || changes.title) {
        this.wrapper.setOptions(this.mergeOptions());
        shouldRedraw = true;
      }
      if (shouldRedraw) {
        this.drawChart();
      }
    }
  }
  ngOnDestroy() {
    this.unsubscribeToResizeIfSubscribed();
  }
  /**
   * For listening to events other than the most common ones (available via Output properties).
   *
   * Can be called after the chart emits that it's "ready".
   *
   * Returns a handle that can be used for `removeEventListener`.
   */
  addEventListener(eventName, callback) {
    const handle = this.registerChartEvent(this.chart, eventName, callback);
    this.eventListeners.set(handle, {
      eventName,
      callback,
      handle
    });
    return handle;
  }
  removeEventListener(handle) {
    const entry = this.eventListeners.get(handle);
    if (entry) {
      google.visualization.events.removeListener(entry.handle);
      this.eventListeners.delete(handle);
    }
  }
  updateResizeListener() {
    this.unsubscribeToResizeIfSubscribed();
    if (this.dynamicResize) {
      this.resizeSubscription = fromEvent(window, "resize", {
        passive: true
      }).pipe(debounceTime(100)).subscribe(() => {
        if (this.initialized) {
          this.drawChart();
        }
      });
    }
  }
  unsubscribeToResizeIfSubscribed() {
    if (this.resizeSubscription != null) {
      this.resizeSubscription.unsubscribe();
      this.resizeSubscription = void 0;
    }
  }
  mergeOptions() {
    return __spreadValues({
      title: this.title,
      width: this.width,
      height: this.height
    }, this.options);
  }
  registerChartEvents() {
    google.visualization.events.removeAllListeners(this.wrapper);
    this.registerChartEvent(this.wrapper, "ready", () => {
      google.visualization.events.removeAllListeners(this.chart);
      this.registerChartEvent(this.chart, "onmouseover", (event) => this.mouseover.emit(event));
      this.registerChartEvent(this.chart, "onmouseout", (event) => this.mouseleave.emit(event));
      this.registerChartEvent(this.chart, "select", () => {
        const selection = this.chart.getSelection();
        this.select.emit({
          selection
        });
      });
      this.eventListeners.forEach((x) => x.handle = this.registerChartEvent(this.chart, x.eventName, x.callback));
      this.ready.emit({
        chart: this.chart
      });
    });
    this.registerChartEvent(this.wrapper, "error", (error) => this.error.emit(error));
  }
  registerChartEvent(object, eventName, callback) {
    return google.visualization.events.addListener(object, eventName, callback);
  }
  drawChart() {
    if (this.dashboard != null) {
      return;
    }
    this.wrapper.draw();
  }
};
_GoogleChartComponent.ɵfac = function GoogleChartComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _GoogleChartComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ScriptLoaderService), ɵɵdirectiveInject(DataTableService), ɵɵdirectiveInject(DashboardComponent, 8));
};
_GoogleChartComponent.ɵcmp = ɵɵdefineComponent({
  type: _GoogleChartComponent,
  selectors: [["google-chart"]],
  hostAttrs: [1, "google-chart"],
  inputs: {
    type: "type",
    data: "data",
    columns: "columns",
    title: "title",
    width: "width",
    height: "height",
    options: "options",
    formatters: "formatters",
    dynamicResize: "dynamicResize"
  },
  outputs: {
    ready: "ready",
    error: "error",
    select: "select",
    mouseover: "mouseover",
    mouseleave: "mouseleave"
  },
  exportAs: ["googleChart"],
  standalone: false,
  features: [ɵɵNgOnChangesFeature],
  decls: 0,
  vars: 0,
  template: function GoogleChartComponent_Template(rf, ctx) {
  },
  styles: ["[_nghost-%COMP%]{width:-moz-fit-content;width:fit-content;display:block}"],
  changeDetection: 0
});
var GoogleChartComponent = _GoogleChartComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleChartComponent, [{
    type: Component,
    args: [{
      selector: "google-chart",
      template: "",
      host: {
        class: "google-chart"
      },
      exportAs: "googleChart",
      changeDetection: ChangeDetectionStrategy.OnPush,
      styles: [":host{width:-moz-fit-content;width:fit-content;display:block}\n"]
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: ScriptLoaderService
    }, {
      type: DataTableService
    }, {
      type: DashboardComponent,
      decorators: [{
        type: Optional
      }]
    }];
  }, {
    type: [{
      type: Input
    }],
    data: [{
      type: Input
    }],
    columns: [{
      type: Input
    }],
    title: [{
      type: Input
    }],
    width: [{
      type: Input
    }],
    height: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    formatters: [{
      type: Input
    }],
    dynamicResize: [{
      type: Input
    }],
    ready: [{
      type: Output
    }],
    error: [{
      type: Output
    }],
    select: [{
      type: Output
    }],
    mouseover: [{
      type: Output
    }],
    mouseleave: [{
      type: Output
    }]
  });
})();
var _ChartWrapperComponent = class _ChartWrapperComponent {
  constructor(element, scriptLoaderService) {
    this.element = element;
    this.scriptLoaderService = scriptLoaderService;
    this.error = new EventEmitter();
    this.ready = new EventEmitter();
    this.select = new EventEmitter();
    this.wrapperReadySubject = new ReplaySubject(1);
    this.initialized = false;
  }
  get chart() {
    return this.chartWrapper.getChart();
  }
  get wrapperReady$() {
    return this.wrapperReadySubject.asObservable();
  }
  get chartWrapper() {
    if (!this.wrapper) {
      throw new Error("Cannot access the chart wrapper before initialization.");
    }
    return this.wrapper;
  }
  set chartWrapper(wrapper) {
    this.wrapper = wrapper;
    this.drawChart();
  }
  ngOnInit() {
    this.scriptLoaderService.loadChartPackages().subscribe(() => {
      if (!this.specs) {
        this.specs = {};
      }
      const _a = this.specs, {
        containerId,
        container
      } = _a, specs = __objRest(_a, [
        "containerId",
        "container"
      ]);
      this.wrapper = new google.visualization.ChartWrapper(__spreadProps(__spreadValues({}, specs), {
        container: this.element.nativeElement
      }));
      this.registerChartEvents();
      this.wrapperReadySubject.next(this.wrapper);
      this.drawChart();
      this.initialized = true;
    });
  }
  ngOnChanges(changes) {
    if (!this.initialized) {
      return;
    }
    if (changes.specs) {
      this.updateChart();
      this.drawChart();
    }
  }
  updateChart() {
    if (!this.specs) {
      this.specs = {};
    }
    this.wrapper.setChartType(this.specs.chartType);
    this.wrapper.setDataTable(this.specs.dataTable);
    this.wrapper.setDataSourceUrl(this.specs.dataSourceUrl);
    this.wrapper.setDataSourceUrl(this.specs.dataSourceUrl);
    this.wrapper.setQuery(this.specs.query);
    this.wrapper.setOptions(this.specs.options);
    this.wrapper.setRefreshInterval(this.specs.refreshInterval);
    this.wrapper.setView(this.specs.view);
  }
  drawChart() {
    if (this.wrapper) {
      this.wrapper.draw();
    }
  }
  registerChartEvents() {
    google.visualization.events.removeAllListeners(this.wrapper);
    const registerChartEvent = (object, eventName, callback) => {
      google.visualization.events.addListener(object, eventName, callback);
    };
    registerChartEvent(this.wrapper, "ready", () => this.ready.emit({
      chart: this.chart
    }));
    registerChartEvent(this.wrapper, "error", (error) => this.error.emit(error));
    registerChartEvent(this.wrapper, "select", () => {
      const selection = this.chart.getSelection();
      this.select.emit({
        selection
      });
    });
  }
};
_ChartWrapperComponent.ɵfac = function ChartWrapperComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ChartWrapperComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ScriptLoaderService));
};
_ChartWrapperComponent.ɵcmp = ɵɵdefineComponent({
  type: _ChartWrapperComponent,
  selectors: [["chart-wrapper"]],
  hostAttrs: [1, "chart-wrapper"],
  inputs: {
    specs: "specs"
  },
  outputs: {
    error: "error",
    ready: "ready",
    select: "select"
  },
  exportAs: ["chartWrapper"],
  standalone: false,
  features: [ɵɵNgOnChangesFeature],
  decls: 0,
  vars: 0,
  template: function ChartWrapperComponent_Template(rf, ctx) {
  },
  styles: [_c1],
  changeDetection: 0
});
var ChartWrapperComponent = _ChartWrapperComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartWrapperComponent, [{
    type: Component,
    args: [{
      selector: "chart-wrapper",
      template: "",
      host: {
        class: "chart-wrapper"
      },
      exportAs: "chartWrapper",
      changeDetection: ChangeDetectionStrategy.OnPush,
      styles: [":host{width:-moz-fit-content;width:fit-content;display:block}\n"]
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: ScriptLoaderService
    }];
  }, {
    specs: [{
      type: Input
    }],
    error: [{
      type: Output
    }],
    ready: [{
      type: Output
    }],
    select: [{
      type: Output
    }]
  });
})();
var _GoogleChartsModule = class _GoogleChartsModule {
  static forRoot(config = {}) {
    return {
      ngModule: _GoogleChartsModule,
      providers: [{
        provide: GOOGLE_CHARTS_CONFIG,
        useValue: config
      }]
    };
  }
};
_GoogleChartsModule.ɵfac = function GoogleChartsModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _GoogleChartsModule)();
};
_GoogleChartsModule.ɵmod = ɵɵdefineNgModule({
  type: _GoogleChartsModule,
  declarations: [GoogleChartComponent, ChartWrapperComponent, DashboardComponent, ControlWrapperComponent, ChartEditorComponent],
  exports: [GoogleChartComponent, ChartWrapperComponent, DashboardComponent, ControlWrapperComponent, ChartEditorComponent]
});
_GoogleChartsModule.ɵinj = ɵɵdefineInjector({
  providers: [ScriptLoaderService]
});
var GoogleChartsModule = _GoogleChartsModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleChartsModule, [{
    type: NgModule,
    args: [{
      declarations: [GoogleChartComponent, ChartWrapperComponent, DashboardComponent, ControlWrapperComponent, ChartEditorComponent],
      providers: [ScriptLoaderService],
      exports: [GoogleChartComponent, ChartWrapperComponent, DashboardComponent, ControlWrapperComponent, ChartEditorComponent]
    }]
  }], null, null);
})();
function provideGoogleCharts(config = {}) {
  return makeEnvironmentProviders([ScriptLoaderService, DataTableService, {
    provide: GOOGLE_CHARTS_CONFIG,
    useValue: config
  }]);
}
var _GoogleChart = class _GoogleChart extends GoogleChartComponent {
};
_GoogleChart.ɵfac = /* @__PURE__ */ (() => {
  let ɵGoogleChart_BaseFactory;
  return function GoogleChart_Factory(__ngFactoryType__) {
    return (ɵGoogleChart_BaseFactory || (ɵGoogleChart_BaseFactory = ɵɵgetInheritedFactory(_GoogleChart)))(__ngFactoryType__ || _GoogleChart);
  };
})();
_GoogleChart.ɵcmp = ɵɵdefineComponent({
  type: _GoogleChart,
  selectors: [["google-chart"]],
  hostAttrs: [1, "google-chart"],
  exportAs: ["googleChart"],
  features: [ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function GoogleChart_Template(rf, ctx) {
  },
  styles: [_c1]
});
var GoogleChart = _GoogleChart;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleChart, [{
    type: Component,
    args: [{
      selector: "google-chart",
      template: "",
      host: {
        class: "google-chart"
      },
      exportAs: "googleChart",
      standalone: true,
      styles: [":host{width:-moz-fit-content;width:fit-content;display:block}\n"]
    }]
  }], null, null);
})();
var _ChartWrapper = class _ChartWrapper extends ChartWrapperComponent {
};
_ChartWrapper.ɵfac = /* @__PURE__ */ (() => {
  let ɵChartWrapper_BaseFactory;
  return function ChartWrapper_Factory(__ngFactoryType__) {
    return (ɵChartWrapper_BaseFactory || (ɵChartWrapper_BaseFactory = ɵɵgetInheritedFactory(_ChartWrapper)))(__ngFactoryType__ || _ChartWrapper);
  };
})();
_ChartWrapper.ɵcmp = ɵɵdefineComponent({
  type: _ChartWrapper,
  selectors: [["chart-wrapper"]],
  hostAttrs: [1, "chart-wrapper"],
  exportAs: ["chartWrapper"],
  features: [ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function ChartWrapper_Template(rf, ctx) {
  },
  styles: [_c1]
});
var ChartWrapper = _ChartWrapper;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartWrapper, [{
    type: Component,
    args: [{
      selector: "chart-wrapper",
      template: "",
      host: {
        class: "chart-wrapper"
      },
      exportAs: "chartWrapper",
      standalone: true,
      styles: [":host{width:-moz-fit-content;width:fit-content;display:block}\n"]
    }]
  }], null, null);
})();
var _Dashboard = class _Dashboard extends DashboardComponent {
};
_Dashboard.ɵfac = /* @__PURE__ */ (() => {
  let ɵDashboard_BaseFactory;
  return function Dashboard_Factory(__ngFactoryType__) {
    return (ɵDashboard_BaseFactory || (ɵDashboard_BaseFactory = ɵɵgetInheritedFactory(_Dashboard)))(__ngFactoryType__ || _Dashboard);
  };
})();
_Dashboard.ɵcmp = ɵɵdefineComponent({
  type: _Dashboard,
  selectors: [["dashboard"]],
  hostAttrs: [1, "dashboard"],
  exportAs: ["dashboard"],
  features: [ɵɵInheritDefinitionFeature],
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function Dashboard_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2
});
var Dashboard = _Dashboard;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Dashboard, [{
    type: Component,
    args: [{
      selector: "dashboard",
      template: "<ng-content></ng-content>",
      exportAs: "dashboard",
      host: {
        class: "dashboard"
      },
      standalone: true
    }]
  }], null, null);
})();
var _ControlWrapper = class _ControlWrapper extends ControlWrapperComponent {
};
_ControlWrapper.ɵfac = /* @__PURE__ */ (() => {
  let ɵControlWrapper_BaseFactory;
  return function ControlWrapper_Factory(__ngFactoryType__) {
    return (ɵControlWrapper_BaseFactory || (ɵControlWrapper_BaseFactory = ɵɵgetInheritedFactory(_ControlWrapper)))(__ngFactoryType__ || _ControlWrapper);
  };
})();
_ControlWrapper.ɵcmp = ɵɵdefineComponent({
  type: _ControlWrapper,
  selectors: [["control-wrapper"]],
  hostAttrs: [1, "control-wrapper"],
  exportAs: ["controlWrapper"],
  features: [ɵɵInheritDefinitionFeature],
  decls: 0,
  vars: 0,
  template: function ControlWrapper_Template(rf, ctx) {
  },
  encapsulation: 2
});
var ControlWrapper = _ControlWrapper;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ControlWrapper, [{
    type: Component,
    args: [{
      selector: "control-wrapper",
      template: "",
      host: {
        class: "control-wrapper"
      },
      exportAs: "controlWrapper",
      standalone: true
    }]
  }], null, null);
})();
var _ChartEditor = class _ChartEditor extends ChartEditorComponent {
};
_ChartEditor.ɵfac = /* @__PURE__ */ (() => {
  let ɵChartEditor_BaseFactory;
  return function ChartEditor_Factory(__ngFactoryType__) {
    return (ɵChartEditor_BaseFactory || (ɵChartEditor_BaseFactory = ɵɵgetInheritedFactory(_ChartEditor)))(__ngFactoryType__ || _ChartEditor);
  };
})();
_ChartEditor.ɵcmp = ɵɵdefineComponent({
  type: _ChartEditor,
  selectors: [["chart-editor"]],
  hostAttrs: [1, "chart-editor"],
  features: [ɵɵInheritDefinitionFeature],
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function ChartEditor_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2
});
var ChartEditor = _ChartEditor;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartEditor, [{
    type: Component,
    args: [{
      selector: "chart-editor",
      template: `<ng-content></ng-content>`,
      host: {
        class: "chart-editor"
      },
      standalone: true
    }]
  }], null, null);
})();
export {
  ChartEditor,
  ChartEditorComponent,
  ChartEditorRef,
  ChartType,
  ChartWrapper,
  ChartWrapperComponent,
  ControlWrapper,
  ControlWrapperComponent,
  Dashboard,
  DashboardComponent,
  DataTableService,
  FilterType,
  GOOGLE_CHARTS_CONFIG,
  GOOGLE_CHARTS_LAZY_CONFIG,
  GoogleChart,
  GoogleChartComponent,
  GoogleChartsModule,
  ScriptLoaderService,
  getDefaultConfig,
  getPackageForChart,
  provideGoogleCharts
};
//# sourceMappingURL=angular-google-charts.js.map
