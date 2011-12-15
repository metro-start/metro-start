(function($){
    $.fn.metroSelect = function(options) {
        var settings = $.extend( {
            'peeking'           : '2',
            'active-class'      : 'sel-active',
            'onchange'          : function(){}
        }, options);

        var uniq = this.attr("id") + "-";
        var sel = $("<div id='" + uniq + "selector'><div class='inner-selector' id='" + uniq + "inner-selector'></div></div>");
        var select = this;
        sel.attr("class", select.attr("class"));
        select.parent().append(sel);
        isel = $("#" + uniq + "inner-selector");
        
        select.hide();
        var max_width = 0;
        select.children().each(function(key, val) {
            var opt = $("<span class='sel-opt' id='" + uniq + "sel-" + key + "'>" + val.text + "</span>");
            isel.append(opt);
            max_width = Math.max(max_width, opt.width());
        });
        //left side button
        $("#" + uniq + "sel-0").click(function () {
            //if left button clicked, swipe left
            select.prop("selectedIndex", 0);
            $("#" + uniq + "sel-0").addClass(settings['active-class']);
            $("#" + uniq + "sel-1").removeClass(settings['active-class']);
            $("#" + uniq + "selector").animate({scrollLeft: 0}, "fast");
            settings.onchange();
        });

        //right side button
        $("#" + uniq + "sel-1").click(function () {
            //if the right button clicked swipe right
            select.prop("selectedIndex", 1);
            $("#" + uniq + "sel-0").removeClass(settings['active-class']);
            $("#" + uniq + "sel-1").addClass(settings['active-class']);
            $("#" + uniq + "selector").animate({scrollLeft: $("#" + uniq + "sel-1").offset().left + max_width}, "fast");
            //$("#" + uniq + "selector").animate({scrollLeft: max_width}, "fast");
            settings.onchange();
        });

        //setup the view and show what needs to be shown
        //sel.css('height', $("#" + uniq + "sel-opt").css('font-size'));
        sel.css('width', max_width + max_width/parseInt(settings['peeking']));
        sel.css('overflow', 'hidden');
        
        //set the default visibilities
        $("#" + uniq + "sel-" + select.prop("selectedIndex")).click();
    };
})(jQuery);
