$(document).ready(function () {
    //Activate  Modal window
    //NOTE: if we omit this, models won't show
    //Make modal draggable and resizable
    $('.modal-content').resizable();
    $('.modal-dialog').draggable();

    $('#region').on('change', function(){
        change_inRegion($(this).val(), auto_set_region=false);
    });

    $('#year').on('change', function(){
        change_inYear($(this).val());
    });

<<<<<<< HEAD
    $('#variable').on('change', function(){
=======
    $('#years').on('change', function() {
        change_inYears($(this).val());
    });
     $('#variable').on('change', function(){
>>>>>>> central
        change_inVariable($(this).val());
    });

    $('#t_res').on('change', function(){
        change_inTRes($(this).val());
    });

<<<<<<< HEAD
=======
    $('#time_period').on('change', function(){
        change_inTimePeriod($(this).val());
    });

    $('#time_period_statistic').on('change', function(){
        change_inTimePeriodStat($(this).val());
    });
>>>>>>> central
});
