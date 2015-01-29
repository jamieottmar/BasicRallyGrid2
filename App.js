Ext.define('CustomApp', 
{
    extend: 'Rally.app.App',
    componentCls: 'app',

    myStore: undefined,
    myGrid:  undefined,
    launch: function() 
    {
        console.log('Our Second App woot!');

        this.pulldownContainer = Ext.create('Ext.container.Container',
        {
            layout:
            {
                type: 'hbox',   // horizontal layout
                align: 'stretch'
            },
        });
        this.add(this.pulldownContainer);

        this._loadIterations();
    },

//------------------------------------------------------------------------------------------------------
    _loadIterations: function()
    {
        this.iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', //"global"
        {
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 225,
            listeners:
            {
                ready: function(combobox)
                {
                     console.log('ready!', combobox)
                     this._loadSeverity();
                },
                select: function(combobox, records)
                {
                    this._loadData();
                },
                scope: this
            }
        });
        this.pulldownContainer.add(this.iterationComboBox); // add iteration combo box to the app
    },

//------------------------------------------------------------------------------------------------------
    _loadSeverity: function()
    {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox',
        {
            fieldLabel: 'Severity',
            labelAlign: 'right',
            model: 'Defect',
            field: 'Severity',
            listeners:
            {
                ready: function(combobox)
                {
                     console.log('ready!', combobox)
                     this._loadData();
                },
                select: function(combobox, records)
                {
                    this._loadData();
                },
                scope: this
            }
        });
        this.pulldownContainer.add(this.severityComboBox);
    },

//------------------------------------------------------------------------------------------------------
    // Get Data from Rally
    _loadData: function()  //Underscore notation-private functions meant to be called internally
    {
        var selectedIterationRef = this.iterationComboBox.getRecord().get('_ref');

        var selectedSeverityValue = this.severityComboBox.getRecord().get('value');
        console.log('selected severity', selectedSeverityValue)

        console.log('selected iteration', selectedIterationRef)

        var myFilters =  
            [
               {
                   property: 'Iteration',     //filter by the iteration currently selected in dropdown
                   operation: '=',
                   value: selectedIterationRef
               },
               {
                   property: 'Severity',     //filter by the Severity currently selected in dropdown
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
           // Create Store
           this.defectStore = Ext.create('Rally.data.wsapi.Store',  // Store contains records of data
           {
               model: 'Defect',
               autoLoad: true,
               filters: myFilters,
               listeners:    // Events that are going to Fire when data is loaded
               {
                  // load is called when data comes back from rally
                  load: function(defectStore, myData, success) //records, operation, success
                  {
                     console.log('got data!', defectStore, myData, success);
                     if (!this.myGrid)
                     {
                         this._createGrid(defectStore); //goes out to App and calls loadGrid
                     }
                  },
                  scope: this // this is so when listeners are fired later, they have ref to app itself
               },
               fetch: ['FormattedID', 'Name', 'Severity', 'Iteration'] //fetched out of wsapi attributes of US
           });
        }
    },

//------------------------------------------------------------------------------------------------------
    // Create Grid and show grid of stories (or other artifacts)
    _createGrid: function(myStoryStore) 
    {
        //when we get data, create grid.
        this.myGrid = Ext.create('Rally.ui.grid.Grid', 
        {
            store: myStoryStore,
            columnCfgs: ['FormattedID', 'Name', 'Severity', 'Iteration']
        });

        this.add(this.myGrid); // add grid to app
        console.log('what is this?', this);
    }
});
