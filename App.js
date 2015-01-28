Ext.define('CustomApp', 
{
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() 
    {
        console.log('Our First App woot!');
        this._loadData(); //goes out to App and calls loadData
    },

    // Get Data from Rally
    _loadData: function()  //Underscore notation-private functions meant to be called internally
    {
        var myStore = Ext.create('Rally.data.wsapi.Store',  // Store contains records of data
        {
            model: 'User Story',
            autoLoad: true,
            listeners:    // Events that are going to Fire when data is loaded
            {
               // load is called when data comes back from rally
               load: function(myStore, myData, success) //records, operation, success
               { 
                  console.log('got data!', myStore, myData, success);
                  this._loadGrid(myStore); //goes out to App and calls loadGrid
               },
               scope: this // this is so when listeners are fired later, they have ref to app itself
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState'] //fetched out of wsapi attributes of US
        });
    },

    // Create Grid and show grid of stories (or other artifacts)
    _loadGrid: function(myStoryStore) 
    {
        //when we get data, create grid.
        var myGrid = Ext.create('Rally.ui.grid.Grid', 
        {
            store: myStoryStore,
            columnCfgs: ['FormattedID', 'Name', 'ScheduleState']
        });

        this.add(myGrid); // add grid to app
        console.log('what is this?', this);
    }
});
