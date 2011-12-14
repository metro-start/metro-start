(function($){
    $.fn.metroSelect = function(options) {
        var settings = $.extend( {
            'peeking'           : '2',
            'active-class'      : 'sel-active',
            'onchange'          : function(){}
        }, options);

        var uniq = this.attr("id") + "-";
        var sel = $("<div id='" + uniq + "selector'><div id='" + uniq + "inner-selector'></div></div>");
        var select = this;
        select.parent().append(sel);
        isel = $("#" + uniq + "inner-selector");
        
        var original_val = select.val();
        select.hide();
        select.val(original_val);
        var max_width = 0;
        var total_width = 0;
        select.children().each(function(key, val) {
            var opt = $("<span class='sel-opt' id='" + uniq + "sel-" + key + "'>" + val.text + "</span>");
            isel.append(opt);
            max_width = Math.max(max_width, opt.width());
            total_width += opt.width();
        });
        
        //left side button
        $("#" + uniq + "sel-0").click(function () {
            //if left button clicked, swipe left
                select.val($("#" + uniq + "sel-0").text());
                $("#" + uniq + "sel-0").addClass(settings['active-class']);
                $("#" + uniq + "sel-1").removeClass("sel-active");
                $("#" + uniq + "selector").animate({scrollLeft: 0}, "fast");
                settings.onchange();
        });

        //right side button
        $("#" + uniq + "sel-1").click(function () {
            //if the right button clicked swipe right
                select.val($("#" + uniq + "sel-1").text());
                $("#" + uniq + "sel-0").removeClass(settings['active-class']);
                $("#" + uniq + "sel-1").addClass(settings['active-class']);
                $("#" + uniq + "selector").animate({scrollLeft: $("#" + uniq + "sel-1").offset().left}, "fast");
                settings.onchange();
        });

        //setup the view and show what needs to be shown
        isel.css('width', total_width);
        sel.css('height', $("sel-opt").css('font-size'));
        sel.css('width', max_width + max_width/parseInt(settings['peeking']));
        sel.css('overflow', 'hidden');
        
        //set the default visibilities
        if(select.val() == $("#" + uniq + "sel-1").text()) { 
            $("#" + uniq + "sel-1").click();
        } else {
            $("#" + uniq + "sel-0").click();
        }
    };
})(jQuery);
