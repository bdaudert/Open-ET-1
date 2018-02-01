$(document).ready(function () {

    //Activate  Modal window
    //NOTE: if we omit this, models won't show
    //$('#dataModal').modal('toggle');
    //$('#modalError').modal('toggle');
    //Make modal draggable and resizable
    $('.modal-content').resizable();
    $('.modal-dialog').draggable();

    //-------------------------
    // Date Picker
    //-------------------------
    $( "#start_date" ).datepicker({
        showOn: "button",
        buttonImage: "media/img/calendar_logo.gif",
        buttonImageOnly: true,
        buttonText: "Open Calendar",
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 3,
        minDate: $('#min_date').val(),
        maxDate: $('#max_date').val(),
        yearRange: $('#min_date').val().slice(0,4) + ":" + $('#max_date').val().slice(0,4),
        dateFormat: "yy-mm-dd",
        onClose: function( selectedDate ) {
            $( "#end_date" ).datepicker( "option", "minDate", selectedDate);
        }
    });

    $( "#end_date" ).datepicker({
        showOn: "button",
        buttonImage: "media/img/calendar_logo.gif",
        buttonImageOnly: true,
        buttonText: "Open Calendar",
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 3,
        minDate: $('#min_date').val(),
        maxDate: $('#max_date').val(),
        yearRange: $('#min_date').val().slice(0,4) + ":" + $('#max_date').val().slice(0,4),
        dateFormat: "yy-mm-dd",
        onClose: function( selectedDate ) {
            $( "#start_date" ).datepicker( "option", "maxDate", selectedDate);
        }
    });

    
    $('#region').on('change', function(){
    	//Delete old layer
        MAP_APP.delete_layer(1);
        //Set new layer
        //MAP_APP.set_ft_map_layer(1);
        MAP_APP.set_geojson_map_layer(1);
        change_inRegion($(this).val());

    });
    $('#field_year').on('change', function(){
    	//Delete old layer
        MAP_APP.delete_layer(1);
        //Set new layer
        //MAP_APP.set_ft_map_layer(1);
        MAP_APP.set_geojson_map_layer(1);
    });
    $('#variable').on('change', function(){
    	//Delete old layer
        MAP_APP.delete_layer(1);
        //Set new layer
        //MAP_APP.set_ft_map_layer(1);
        MAP_APP.set_geojson_map_layer(1);
        //Set the dataset options
        change_inVariable($(this).val());
    });
    $('#temporal_resolution').on('change', function(){
    	//Delete old layer
        MAP_APP.delete_layer(1);
        //Set new layer
        //MAP_APP.set_ft_map_layer(1);
        MAP_APP.set_geojson_map_layer(1);
    	//Set time_period
        change_inResolution($(this).val());
    });
    
});