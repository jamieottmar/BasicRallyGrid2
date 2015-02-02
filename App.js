//------------------------------------------------------------------------------------------------------
//Custom Rally App that displays Defects in a grid and filters by Iteration and/or Severity
//------------------------------------------------------------------------------------------------------
Ext.define('CustomApp', 
{
    extend: 'Rally.app.App',    //The parent class manages the app and 'lifecycle' and calls launch() when ready
    componentCls: 'app',        //CSS Styles found in app.css

    myStore: undefined,         //App level references to the store and grid for easy access in methods
    myGrid:  undefined,

    //Entry point to the App
    launch: function() 
    {
        console.log('Our Second App woot!'); //see console api

        //Create a container to control the layout of the iteration/severity pulldowns (added below)
        this.pulldownContainer = Ext.create('Ext.container.Container',
        {
            layout:
            {
                type: 'hbox',       // horizontal layout
                align: 'stretch'
            }
        });
        //Must add the (empty) pulldown container to the app to be a part of the rendering lifecycle
        this.add(this.pulldownContainer);

        this._loadIterations();
    },

//------------------------------------------------------------------------------------------------------
// Create Iteration Pulldown and Load Iterations
//------------------------------------------------------------------------------------------------------
    _loadIterations: function()
    {
        this.iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', //"global var"
        {
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 225,
            listeners:
            {
                //on Ready: during init of app, after iterations are loaded, get defect severities
                ready: function(combobox)
                {
                     this._loadSeverity();
                },
                //on Select: after app is loaded, when user selects iteration, just reload the data
                select: function(combobox, records)
                {
                    this._loadData();
                },
                scope: this
            }
        });
        //Add the iteration list to pulldown container so it lays out horizontal
        this.pulldownContainer.add(this.iterationComboBox);
    },

//------------------------------------------------------------------------------------------------------
// Create Defect Severity Pulldown Then Load Data
//------------------------------------------------------------------------------------------------------
    _loadSeverity: function()
    {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox',  //"global var"
        {
            fieldLabel: 'Severity',
            labelAlign: 'right',
            model: 'Defect',
            field: 'Severity',
            listeners:
            {
                //last data pulldown to load so both events go to just load the actual defect data
                ready: function(combobox)
                {
                     this._loadData();
                },
                select: function(combobox, records)
                {
                    this._loadData();
                },
                //Dont forget to pass 'app' level scope into the combobox
                //This is so the asynchronous event functions can call app-level functions.
                scope: this
            }
        });
        //Add severity list to the pulldown container to it lays out horizontal
        this.pulldownContainer.add(this.severityComboBox);
    },

//------------------------------------------------------------------------------------------------------
// Get Data From Rally
//------------------------------------------------------------------------------------------------------
    _loadData: function()  //Underscore notation-private functions meant to be called internally
    {
        //Query on the _ref since its unique, unlike the iteration name that can change
        var selectedIterationRef = this.iterationComboBox.getRecord().get('_ref');

        var selectedSeverityValue = this.severityComboBox.getRecord().get('value');

        //In this format, these filters are AND'd together; use Rally.data.wsapi.Filter for AND/OR constructs
        var myFilters =  
            [
               {
                   property: 'Iteration',   //filter by the iteration currently selected in dropdown
                   operation: '=',
                   value: selectedIterationRef
               },
               {
                   property: 'Severity',    //filter by the Severity currently selected in dropdown
                   operation: '=',
                   value: selectedSeverityValue
               }
            ];
        // If store exists, just load new data
        if(this.defectStore) 
        {
            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
        }
        else
        {   
           // Create defectStore on the App level ('this') so code above can check it's existence
           this.defectStore = Ext.create('Rally.data.wsapi.Store',  // Store contains records of data
           {
               model: 'Defect',
               autoLoad: true, //***Remember to set this to true.
               filters: myFilters,
               listeners:    // Events that are going to Fire when data is loaded
               {
                  // load is called when data comes back from rally
                  load: function(defectStore, myData, success) //records, operation, success
                  {
                     console.log('got data!', defectStore, myData, success);
                     // Create a grid ONLY if one has not already been created
                     if (!this.myGrid)
                     {
                         this._createGrid(defectStore); //goes out to App and calls loadGrid
                     }
                  },
                  scope: this // this is so when listeners above are fired later, they have ref to app itself
               },
               fetch: ['FormattedID', 'Name', 'Severity', 'Iteration'] //fetched out of wsapi attributes of US
           });
        }
    },

//------------------------------------------------------------------------------------------------------
// Create and Show a Grid of Given Defects
//------------------------------------------------------------------------------------------------------
    // Create Grid and show grid of stories (or other artifacts)
    _createGrid: function(myDefectStore) 
    {
        //when we get data, create grid.
        this.myGrid = Ext.create('Rally.ui.grid.Grid', 
        {
            store: myDefectStore,
            // Columns to display. Must be same names specified in fetch: command. (wsapi data store)
            columnCfgs: ['FormattedID', 'Name', 'Severity', 'Iteration']
        });
        // add grid component to app-level container (Using 'this.add' allows it to use app container
        this.add(this.myGrid); // add grid to app
        console.log('what is this?', this);
    }
});
